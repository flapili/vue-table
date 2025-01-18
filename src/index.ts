import type { Ref, SlotsType, VNode } from 'vue'
import { computed, defineComponent, h, isRef, ref, useAttrs, useSlots, warn, watch } from 'vue'

type Awaitable<T> = T | PromiseLike<T>

interface Context<Filters extends object, Sorting extends object> {
  loading: boolean
  page: number
  pageSize: number
  totalPages: number
  maxLength: number
  canGoToNextPage: boolean
  canGoToPreviousPage: boolean
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  totalLength: number
  filters: Filters
  sorting: Sorting
}

interface Row {
  key: PropertyKey
  [_: PropertyKey]: any
}

export function useTable<
  Data extends Row,
  Filters extends object,
  Sorting extends object,
>(
  data: (ctx: { page: number, pageSize: number, filters: Filters, sorting: Sorting }) => Awaitable<{ rows: Data[], totalLength: number }>,
  {
    pageSize = 10,
    filters = {} as Filters,
    sorting = {} as Sorting,
  }: {
    /**
     * The number of rows per page.
     *
     * @default 10
     */
    pageSize?: number
    /**
     * Filters to apply to the table, passed to the data function getter.
     *
     * @default {}
     */
    filters?: Filters
    /**
     * Sorting to apply to the table, passed to the data function getter.
     *
     * @default {}
     */
    sorting?: Sorting
  } = {},
) {
  const localData = ref<Data[]>([])
  const localPageSize = ref(pageSize)
  const localPage = ref(1)
  const localFilters = ref(filters)
  const localSorting = ref(sorting)

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
    () => localFilters.value,
    () => localSorting.value,
  ], async ([
    page,
    pageSize,
    filters,
    sorting,
  ]) => {
    loading.value = true
    try {
      const result = await data({ page, pageSize, filters, sorting })
      localData.value = result.rows
      totalLength.value = result.totalLength
    }
    catch (e) {
      console.error(e)
    }
    finally {
      loading.value = false
    }
  }, { immediate: true, deep: true })

  type Slots = SlotsType<{
    [C in `col-${string}`]: (props: { ctx: Context<Filters, Sorting> }) => any
  } & {
    [C in `row-${string}`]: (props: { row: Data, ctx: Context<Filters, Sorting> }) => any
  } & {
    'header'?: (props: Context<Filters, Sorting>) => any
    'footer'?: (props: Context<Filters, Sorting>) => any
    'col-key'?: (props: { ctx: Context<Filters, Sorting> }) => any
    'row-key'?: (props: { row: Data, ctx: Context<Filters, Sorting> }) => any
  }>

  const Component = defineComponent({
    inheritAttrs: false,
    slots: Object as Slots,
    setup() {
      const slots = useSlots()
      const attrs = useAttrs()

      const columnNames = computed(() => {
        return Object.keys(slots)
          .filter(slotName => slotName.startsWith('col-'))
          .map(slotName => slotName.replace('col-', ''))
      })

      watch(columnNames, (columnNames) => {
        columnNames.forEach((columnName) => {
          if (!slots[`row-${columnName}`])
            warn(`No slot for row ${columnName}`)
        })
      }, { immediate: true })

      return () => {
        const ctx = {
          page: localPage.value,
          pageSize: localPageSize.value,
          totalPages: totalPages.value,
          setPage,
          setPageSize,
          totalLength: totalLength.value,
          canGoToNextPage: canGoToNextPage.value,
          canGoToPreviousPage: canGoToPreviousPage.value,
          filters: localFilters.value,
          sorting: localSorting.value,
        }
        const children: VNode[] = []
        if (slots.header)
          // @ts-expect-error slots.header is not typed
          children.push(slots.header(ctx))

        children.push(h('table', attrs, [
          h('thead', [
            h('tr', columnNames.value.map(columnName => h('th', {
              key: columnName,
              style: 'padding: 0px',
            }, slots[`col-${columnName}`]?.(ctx)),
            )),
          ]),
          h('tbody', [
            localData.value.map(row => h('tr', columnNames.value.map(columnName => h('td', {
              key: columnName,
              style: 'padding: 0px',
            }, slots[`row-${columnName}`]?.({ row, ctx })),
            )),
            ),
          ]),
        ]))

        if (slots.footer)
          // @ts-expect-error slots.footer is not typed
          children.push(slots.footer(ctx))

        return children
      }
    },
  })

  return Component
}
