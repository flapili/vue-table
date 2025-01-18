# @flapili/vue-table

A flexible and type-safe table component for Vue 3 with built-in pagination, filtering, and sorting capabilities.

## Features

- 🔒 Fully type-safe with TypeScript
- 📊 Built-in pagination support
- 🔍 Customizable filtering
- ↕️ Flexible sorting
- 🎨 Slot-based customization
- ⚡ Async data loading support
- 🎯 Simple and intuitive API

## Installation

```bash
npm install @flapili/vue-table # npm
pnpm add @flapili/vue-table # pnpm
yarn add @flapili/vue-table # yarn
```

## Usage

Here's a basic example of how to use the table component:

```vue
<script setup lang="ts">
import { useTable } from '@flapili/vue-table'

const rows = ref(Array.from({ length: 52 }, (_, i) => ({ key: `id ${i}`, name: `name ${i}`, age: i })))

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const TableComponentToUseInTemplate = useTable(async ({ page, pageSize, filters, sorting }) => {
  await sleep(500)

  const start = (page - 1) * pageSize
  const end = start + pageSize

  const filtered = rows.value.filter(row => filters.foo.length ? row.name.includes(filters.foo) : true)
  const sorted = filtered.sort((a, b) => sorting.order === 'asc' ? a.age - b.age : b.age - a.age)

  const res = sorted.slice(start, end)

  return { rows: res, totalLength: filtered.length }
}, {
  filters: { foo: '' },
  sorting: { order: 'asc' as 'asc' | 'desc' },
})
</script>

<template>
  <div class="size-full flex flex-col items-center justify-center">
    <h1 class="text-2xl font-bold">
      Please don't pay attention to fabulous styling, it's just a demo
    </h1>
    <div class="mt-4 flex flex-col bg-yellow">
      <TableComponentToUseInTemplate class="w-full">
        <template #header="{ filters, sorting }">
          header
          <input v-model="filters.foo" type="text" placeholder="filter" class="m-2 border">
          <button @click="sorting.order = sorting.order === 'asc' ? 'desc' : 'asc'">
            {{ sorting.order }}
          </button>
        </template>
        <template #col-name>
          <div class="bg-blue px-2">
            Name
          </div>
        </template>
        <template #col-age>
          <div class="bg-green px-2">
            Age
          </div>
        </template>
        <template #row-name="{ row, ctx: { loading } }">
          <div class="bg-red px-2">
            <template v-if="loading">
              loading ...
            </template>
            <template v-else>
              {{ row.name }}
            </template>
          </div>
        </template>
        <template #row-age="{ row, ctx: { loading } }">
          <div class="bg-gray px-2">
            <template v-if="loading">
              loading ...
            </template>
            <template v-else>
              {{ row.age }}
            </template>
          </div>
        </template>
        <template #footer="{ setPage, page, totalPages, setPageSize }">
          <div class="bg-blue px-2">
            <button @click="setPage(page - 1)">
              prev
            </button>
            <button @click="setPage(page + 1)">
              next
            </button>
            {{ page }} / {{ totalPages }}
          </div>
          <div class="flex gap-2 bg-blue px-2">
            per page
            <button class="bg-red" @click="setPageSize(10)">
              10
            </button>
            <button class="bg-red" @click="setPageSize(20)">
              20
            </button>
          </div>
        </template>
      </TableComponentToUseInTemplate>
    </div>
  </div>
</template>
```

## API Reference

### Context

| Name                  | Description                        |
|-----------------------|------------------------------------|
| `loading`             | Whether the table is loading       |
| `page`                | Current page number                |
| `pageSize`            | Current page size                  |
| `totalPages`          | Total number of pages              |
| `maxLength`           | Total number of rows               |
| `canGoToNextPage`     | Whether next page is available     |
| `canGoToPreviousPage` | Whether previous page is available |
| `setPage`             | Set page function                  |
| `setPageSize`         | Set page size function             |
| `totalLength`         | Total number of rows               |
| `filters`             | Filters object (see below)         |
| `sorting`             | Sorting object (see below)         |

### useTable

useTable parameters:

| Parameter          | Description                                                                                      |
|--------------------|--------------------------------------------------------------------------------------------------|
| `data`             | A function that returns a promise resolving to an array of rows                                  |
| `options`          | The options for the table component                                                              |
| `options.pageSize` | The number of rows per page                                                                      |
| `options.filters`  | A custom object that will be passed to the data function getter, can be edited via slots binding |
| `options.sorting`  | A custom object that will be passed to the data function getter, can be edited via slots binding |

### Return Values

| Name             | Description                          |
|------------------|--------------------------------------|
| `TableComponent` | Vue component to use in the template |

### TableComponent Slot Props

The returned component provides the following props to slot headers and footers:

| Name  | Description    |
|-------|----------------|
| `ctx` | Context object |

The returned component provides the following props to slot columns named `col-<column-name>`:

| Name  | Description    |
|-------|----------------|
| `ctx` | Context object |

The returned component provides the following props to slot rows:

| Name  | Description                                                        |
|-------|--------------------------------------------------------------------|
| `row` | Row object (inferred from the data passed to the `data` parameter) |
| `ctx` | Context object                                                     |

## License

MIT License © 2025 Benoît Deveaux

Missing / todo :

- [ ] Add a contributing guide
- [ ] setup CI/CD
- [ ] setup tests
