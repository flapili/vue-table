<script setup lang="ts">
import { useTable } from '@flapili/vue-table'

const database = Array.from({ length: 52 }, (_, i) => ({ name: `name ${i}`, age: i, expanded: false }))

const Table = useTable(
  async ({ page, pageSize, ctx }) => {
    const start = (page - 1) * pageSize
    const end = start + pageSize
    // simulate a request to a server
    await new Promise(resolve => setTimeout(resolve, 500))

    const filtered = database.filter(row => ctx.filters.byName.length ? row.name.includes(ctx.filters.byName) : true)
    const sorted = filtered.sort((a, b) => ctx.sorting.orderAge === 'asc' ? a.age - b.age : b.age - a.age)

    const res = sorted.slice(start, end)

    return { rows: res, totalLength: filtered.length }
  },
  {
    ctx: {
      filters: { byName: '' },
      sorting: { orderAge: 'asc' as 'asc' | 'desc' },
    },
  },
)

const placeholder = useTemplateRef('placeholder')
</script>

<template>
  <div>
    loading : <span ref="placeholder" /> (teleported)
  </div>

  <div class="size-full flex flex-col items-center">
    <h1 class="text-2xl font-bold">
      Please don't pay attention to fabulous styling, it's just a demo
    </h1>

    <div class="mt-4 flex flex-col border-1 border-black rounded bg-gray-200">
      <div class="p-2 flex overflow-x-auto">
        <Table.Main class="border-collapse">
          <Table.State v-slot="{ loading }">
            <ClientOnly>
              <Teleport :to="placeholder" defer>
                {{ loading }}
              </Teleport>
            </ClientOnly>
          </Table.State>
          <Table.Column>
            <Table.ColumnHead v-slot="{ ctx }" class="border-1 border-black">
              <div class="flex items-center">
                age
                <button class="flex items-center ml-auto pl-1 pr-0.5" @click="ctx.sorting.orderAge = ctx.sorting.orderAge === 'asc' ? 'desc' : 'asc'">
                  <i class="i-heroicons-arrow-up transform duration-500" :class="{ 'rotate-180': ctx.sorting.orderAge === 'desc' }" />
                </button>
              </div>
            </Table.ColumnHead>
            <Table.ColumnCell v-slot="{ row }" class="border-1 border-black p-0 [&:has(.invalid)]:bg-red-500">
              <div :class="{ invalid: row.age < 18 }">
                {{ row.age }}
              </div>
            </Table.ColumnCell>
          </Table.Column>
          <Table.Column>
            <Table.ColumnHead v-slot="{ ctx }" class="border-1 border-black">
              <div class="flex">
                <span class="px-1.5 py-1">name</span>
                <input v-model="ctx.filters.byName" type="text" placeholder="Search by name" class="flex-1 px-1.5 py-1 text-xs focus:outline-none">
              </div>
            </Table.ColumnHead>
            <Table.ColumnCell v-slot="{ row }" class="border-1 border-black p-0">
              <div class="flex items-center">
                <div>
                  <div>
                    {{ row.name }}
                  </div>
                  <div class="text-xs">
                    (What a beautiful name)
                  </div>
                </div>
                <button class="ml-auto" @click="row.expanded = !row.expanded">
                  <i class="i-heroicons-chevron-down" />
                </button>
              </div>
            </Table.ColumnCell>
          </Table.Column>
          <Table.CustomRow v-slot="{ row }" mode="after" class="p-0">
            <td v-if="row.expanded" colspan="2" class="p-0 relative">
              <div class="ml-2 mb-2 border-1 border-t-0 left-1px border-black relative">
                Custom row
              </div>
            </td>
          </Table.CustomRow>
        </Table.Main>
      </div>
    </div>
  </div>
</template>
