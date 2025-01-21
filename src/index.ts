import type { PropType, SlotsType, VNode, VNodeArrayChildren, VNodeChild, VNodeNormalizedChildren } from 'vue'
import { computed, defineComponent, h, isVNode, ref, watch } from 'vue'

type Awaitable<T> = T | PromiseLike<T>

interface BaseSlot {
  loading: boolean
  page: number
  pageSize: number
  totalPages: number
  canGoToNextPage: boolean
  canGoToPreviousPage: boolean
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  totalLength: number
}

function runRenderFunctionForSlot(vNode: VNode, slotName: string, args: any) {
  if (
    vNode.children === null // Not null
    || typeof vNode.children !== 'object' // Not an object
    || Array.isArray(vNode.children) // Not an array
    || !(slotName in vNode.children) // Slot not found
  ) {
    return null
  }
  const f = vNode.children[slotName] as (props: any) => VNodeNormalizedChildren
  return f(args)
}

function ensureIsVNode(vNode: VNodeNormalizedChildren) {
  if (!Array.isArray(vNode) || !vNode.every(isVNode))
    throw new Error('VNode without content detected')

  return vNode
}

export function useTable<RowType, Ctx>(
  data: (args: { page: number, pageSize: number, ctx: Ctx }) => Awaitable<{ rows: RowType[], totalLength: number }>,
  {
    pageSize = 10,
    ctx,
  }: {
    /**
     * The number of rows per page.
     *
     * @default 10
     */
    pageSize?: number
    /**
     * Arbitrary context to pass to the data function getter and to slots.
     */
    ctx?: Ctx
  } = {},
) {
  const localData = ref<RowType[]>([])
  const localCtx = ref(ctx)
  const localPageSize = ref(pageSize)
  const localPage = ref(1)

  const loading = ref(true)
  const totalLength = ref(0)
  const totalPages = computed(() => Math.ceil(totalLength.value / localPageSize.value))
  const canGoToNextPage = computed(() => localPage.value < totalPages.value)
  const canGoToPreviousPage = computed(() => localPage.value > 1)

  const setPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages.value)
      return
    localPage.value = newPage
  }

  const setPageSize = (newPageSize: number) => {
    if (newPageSize < 1)
      return
    localPageSize.value = newPageSize
  }

  watch([
    localPage,
    localPageSize,
    () => localCtx.value,
  ], async ([page, pageSize, ctx]) => {
    loading.value = true
    try {
      const result = await data({ page, pageSize, ctx })
      localData.value = result.rows
      totalLength.value = result.totalLength
    }
    finally {
      loading.value = false
    }
  }, { immediate: true, deep: true })

  const State = defineComponent({
    slots: Object as SlotsType<{
      default: (props: BaseSlot & { rows: RowType[], ctx: Ctx }) => any
    }>,
    setup() {
      return () => {
        throw new Error('State component must be used within the Main component')
      }
    },
  })

  const CustomRow = defineComponent({
    props: {
      mode: {
        type: String as PropType<'before' | 'after'>,
        required: true,
      },
    },
    slots: Object as SlotsType<{
      default: (props: BaseSlot & { ctx: Ctx, row: RowType }) => any
    }>,
    setup() {
      return () => {
        throw new Error('CustomRow component must be used within the Main component')
      }
    },
  })

  const Column = defineComponent({
    setup() {
      return () => {
        throw new Error('Column component must be used within the Main component')
      }
    },
  })

  const ColumnHead = defineComponent({
    slots: Object as SlotsType<{
      default: (props: BaseSlot & { ctx: Ctx }) => any
    }>,
    setup() {
      return () => {
        throw new Error('ColumnHead component must be used within the Column component')
      }
    },
  })

  const ColumnCell = defineComponent({
    slots: Object as SlotsType<{
      default: (props: BaseSlot & { ctx: Ctx, row: RowType }) => any
    }>,
    setup() {
      return () => {
        throw new Error('ColumnCell component must be used within the Column component')
      }
    },
  })

  const Main = defineComponent({
    inheritAttrs: false,
    slots: Object as SlotsType<{
      default: (props: BaseSlot & { ctx: Ctx, rows: RowType[] }) => VNode[]
    }>,
    setup(props, { attrs, slots }) {
      return () => {
        const baseSlot = {
          loading: loading.value,
          page: localPage.value,
          pageSize: localPageSize.value,
          totalPages: totalPages.value,
          setPage,
          setPageSize,
          totalLength: totalLength.value,
          canGoToNextPage: canGoToNextPage.value,
          canGoToPreviousPage: canGoToPreviousPage.value,
        }

        const toRender: VNodeNormalizedChildren = []

        const children = slots.default({ ...baseSlot, ctx: localCtx.value, rows: localData.value as RowType[] })

        children
          .filter(vNode => vNode.type === State)
          .forEach((stateNode) => {
            const r = runRenderFunctionForSlot(stateNode, 'default', { ctx: localCtx.value, rows: localData.value, ...baseSlot })
            if (!r)
              return // empty slot (<State />)
            if (Array.isArray(r))
              toRender.push(r)
          })

        const customRows = {
          before: [] as VNode[],
          after: [] as VNode[],
        }
        const rowVNodes = children.filter((child): child is VNode => isVNode(child) && child.type === CustomRow)
        for (const rowVNode of rowVNodes) {
          const mode = rowVNode.props?.mode as 'before' | 'after'
          customRows[mode].push(rowVNode)
        }

        // Main logic
        {
          const headCells: {
            vNode: VNodeChild
            props: Record<string, any>
          }[] = []

          const rows: {
            cells: { vNode: VNodeNormalizedChildren, props: Record<string, any> }[]
            data: RowType
          }[] = Array.from({ length: localData.value.length }, (_, index) => ({
            cells: [],
            data: localData.value[index] as RowType,
          }))

          const columnVNodes = children.filter((child): child is VNode => isVNode(child) && child.type === Column)
          for (const columnVNode of columnVNodes) {
            const vNode = runRenderFunctionForSlot(columnVNode, 'default', { ctx: localCtx.value, rows: localData.value, ...baseSlot })

            const children = ensureIsVNode(vNode)
            if (children.length !== 2)
              throw new Error('TableColumn must have exactly 2 components children, ColumnHead and ColumnCell')

            const columnCellSlot = children.find((child): child is VNode => isVNode(child) && child.type === ColumnCell)
            if (!columnCellSlot)
              throw new Error('ColumnCell Component missing for Column')

            const head = children.find((child): child is VNode => isVNode(child) && child.type === ColumnHead)
            if (!head)
              throw new Error('ColumnHead Component missing for Column')

            const headSlot = runRenderFunctionForSlot(head, 'default', { ctx: localCtx.value, ...baseSlot })
            if (Array.isArray(headSlot)) {
              headCells.push(...headSlot
                .filter(vNode => isVNode(vNode))
                .map(vNode => ({ vNode, props: head.props ?? {} })))
            }

            localData.value.forEach((row, rowIndex) => {
              const vNode = runRenderFunctionForSlot(columnCellSlot, 'default', { ctx: localCtx.value, row, ...baseSlot })
              rows[rowIndex].cells.push({ vNode, props: columnCellSlot.props ?? {} })
            })
          }

          const thead = h('thead', {}, h('tr', {}, headCells.map(
            cell => h('td', cell.props, cell.vNode!),
          )))

          const tbody = h('tbody', {}, rows.map((row) => {
            const beforeRow = customRows.before
              .filter(customRow => isVNode(customRow))
              .map(vNode => ({
                vNode: runRenderFunctionForSlot(vNode, 'default', { ctx: localCtx.value, row: row.data, ...baseSlot }),
                props: vNode.props ?? {},
              }))
              .filter(r => r.vNode !== null)
              .map(r => h('tr', r.props, r.vNode!))

            const rowContent = h('tr', {}, row.cells.filter(cell => cell.vNode !== null).map(
              (cell) => {
                return h('td', cell.props, cell.vNode!)
              },
            ))

            const afterRow = customRows.after
              .filter(customRow => isVNode(customRow))
              .map(vNode => ({
                vNode: runRenderFunctionForSlot(vNode, 'default', { ctx: localCtx.value, row: row.data, ...baseSlot }),
                props: vNode.props ?? {},
              }))
              .filter(r => r.vNode !== null)
              .map(r => h('tr', r.props, r.vNode!))

            return [...beforeRow, rowContent, ...afterRow]
          }))

          const table = h('table', attrs, [thead, tbody])
          toRender.push(table)
        }

        return toRender
      }
    },
  })

  return {
    Main,
    CustomRow,
    Column,
    State,
    ColumnHead,
    ColumnCell,
  }
}
