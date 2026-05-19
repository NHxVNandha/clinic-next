import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter } from 'react-router-dom'
import {
  CellStyleModule,
  ClientSideRowModelModule,
  ColumnApiModule,
  ColumnAutoSizeModule,
  ColumnHoverModule,
  CsvExportModule,
  DateFilterModule,
  EventApiModule,
  GridStateModule,
  NumberFilterModule,
  PaginationModule,
  PinnedRowModule,
  QuickFilterModule,
  RenderApiModule,
  RowApiModule,
  RowAutoHeightModule,
  RowSelectionModule,
  ScrollApiModule,
  TextFilterModule,
  TooltipModule,
  ValidationModule,
  ModuleRegistry,
} from 'ag-grid-community'
import 'sweetalert2/dist/sweetalert2.min.css'
import './index.css'
import App from './App'

ModuleRegistry.registerModules([
  ValidationModule,
  ClientSideRowModelModule,
  RowSelectionModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  QuickFilterModule,
  ColumnApiModule,
  ColumnHoverModule,
  ColumnAutoSizeModule,
  PinnedRowModule,
  CellStyleModule,
  TooltipModule,
  CsvExportModule,
  PaginationModule,
  RenderApiModule,
  GridStateModule,
  EventApiModule,
  RowApiModule,
  RowAutoHeightModule,
  ScrollApiModule,
])

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
