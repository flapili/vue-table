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

See [examples](./examples)

## API Reference

### useTable

The `useTable` function accepts the following parameters:

| Parameter          | Description                           |
|--------------------|---------------------------------------|
| `data`             | Function that returns paginated data  |
| `options`          | Configuration options                 |
| `options.pageSize` | Initial number of rows per page       |
| `options.ctx`      | Custom context object passed to slots |

### Return Value Components

The `useTable` function returns the following components:

| Component    | Description                                               |
|--------------|-----------------------------------------------------------|
| `Main`       | The main table component that renders the table structure |
| `Column`     | Component to define a table column                        |
| `ColumnHead` | Component to define a column header                       |
| `ColumnCell` | Component to define a column cell                         |
| `CustomRow`  | Component to add custom rows before/after each data row   |
| `State`      | Component to access table state in custom templates       |

### Slot Props

#### Common to all components

| Property              | Description                                      |
|-----------------------|--------------------------------------------------|
| `loading`             | Indicates if the table is currently loading data |
| `page`                | Current page number                              |
| `pageSize`            | Number of items per page                         |
| `totalPages`          | Total number of available pages                  |
| `maxLength`           | Total number of rows in the dataset              |
| `canGoToNextPage`     | Whether there is a next page available           |
| `canGoToPreviousPage` | Whether there is a previous page available       |
| `setPage`             | Function to change the current page              |
| `setPageSize`         | Function to change the page size                 |
| `totalLength`         | Total number of items in the dataset             |
| `ctx`                 | Custom context object passed to useTable         |

#### Main Component Slots

| Slot      | Props                      | Description                 |
|-----------|----------------------------|-----------------------------|
| `default` | `{ ctx, rows, ...common }` | Main slot for table content |

#### Column Component Slots

| Slot      | Props                | Description                |
|-----------|----------------------|----------------------------|
| `default` | `{ ctx, ...common }` | Slot for column definition |

#### ColumnHead Component Slots

| Slot      | Props                | Description                    |
|-----------|----------------------|--------------------------------|
| `default` | `{ ctx, ...common }` | Slot for column header content |

#### ColumnCell Component Slots

| Slot      | Props                     | Description                  |
|-----------|---------------------------|------------------------------|
| `default` | `{ ctx, row, ...common }` | Slot for column cell content |

## License

MIT License © 2025 Benoît Deveaux

Missing / todo :

- [ ] Add a contributing guide
- [ ] setup CI/CD
- [ ] setup tests
