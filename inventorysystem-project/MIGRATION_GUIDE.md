# 📱 Guía de Migración a Sistema Responsive

## ✅ Sistema Implementado

### 1. **Tema Global** (`/src/styles/theme.js`)
- Paleta de colores consistente
- Breakpoints: xs (0px), sm (600px), md (900px), lg (1200px), xl (1536px)
- Tipografía responsive automática
- Componentes Material-UI pre-estilizados

### 2. **Estilos Comunes** (`/src/styles/commonStyles.js`)
- Estilos reutilizables para todo el proyecto
- Mobile-first approach
- Usa `sx` prop de Material-UI (NO `style={{}}` inline)

### 3. **Componentes Wrapper** (`/src/components/ResponsiveWrappers.js`)
- `<PageLayout>` - Wrapper principal de página
- `<PageHeader>` - Encabezado con título + botón agregar
- `<ResponsiveModal>` - Modal que se adapta al tamaño de pantalla
- `<FormLayout>` - Container de formularios
- `<FormRow>` - Fila de formulario (2 cols desktop, 1 col mobile)
- `<ButtonGroup>` - Grupo de botones responsive
- `<ResponsiveTable>` - Wrapper para tablas

## 🔄 Cómo Migrar un Componente

### ANTES (❌ Mal - Estilos inline):
```jsx
<div style={{ display: 'flex', justifyContent: 'space-between' }}>
  <h3 style={{ marginTop: '10px' }}>Título</h3>
  <Button>Agregar</Button>
</div>

<Modal open={open} onClose={close} style={{ display: 'flex', alignItems: 'center' }}>
  <Box style={{ background: '#fff', padding: '20px', width: '450px' }}>
    <TextField label="Nombre" />
  </Box>
</Modal>
```

### DESPUÉS (✅ Bien - Responsive):
```jsx
import { PageLayout, PageHeader, ResponsiveModal, FormLayout } from '../components/ResponsiveWrappers';
import * as styles from '../styles/commonStyles';

<PageLayout>
  <PageHeader 
    title="Título" 
    subtitle="Descripción"
    onAdd={handleAgregar}
    addButtonText="Agregar"
  />
  
  <ResponsiveModal open={open} onClose={close} title="Formulario">
    <FormLayout>
      <TextField label="Nombre" fullWidth />
    </FormLayout>
  </ResponsiveModal>
</PageLayout>
```

## 📝 Pasos de Migración

### 1. Importar dependencias
```jsx
import { Box, Typography } from '@mui/material';
import * as styles from '../styles/commonStyles';
import { PageLayout, PageHeader } from '../components/ResponsiveWrappers';
```

### 2. Reemplazar contenedor principal
**Antes:**
```jsx
<div className="page-container">
  {content}
</div>
```

**Después:**
```jsx
<PageLayout>
  {content}
</PageLayout>
```

### 3. Reemplazar encabezados
**Antes:**
```jsx
<div style={{ display: 'flex', justifyContent: 'space-between' }}>
  <div>
    <h3>Lista de Productos</h3>
    <p>Administre los productos</p>
  </div>
  <Button onClick={handleAdd}>Agregar</Button>
</div>
```

**Después:**
```jsx
<PageHeader 
  title="Lista de Productos"
  subtitle="Administre los productos"
  onAdd={handleAdd}
  addButtonText="Agregar Producto"
/>
```

### 4. Reemplazar modales
**Antes:**
```jsx
<Modal 
  open={open} 
  onClose={close}
  style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
>
  <Box style={{ 
    background: '#fff', 
    padding: '20px', 
    borderRadius: '10px', 
    width: '450px' 
  }}>
    {content}
  </Box>
</Modal>
```

**Después:**
```jsx
<ResponsiveModal 
  open={open} 
  onClose={close}
  title="Título del Modal"
>
  <FormLayout>
    {content}
  </FormLayout>
</ResponsiveModal>
```

### 5. Usar `sx` prop en lugar de `style={{}}`
**Antes:**
```jsx
<Box style={{ padding: '20px', marginTop: '10px' }}>
```

**Después:**
```jsx
<Box sx={styles.cardContainer}>
// O personalizado:
<Box sx={{ padding: { xs: 2, sm: 3 }, marginTop: 2 }}>
```

### 6. Formularios responsive
**Antes:**
```jsx
<div style={{ display: 'flex', gap: '10px' }}>
  <TextField label="Nombre" style={{ flex: 1 }} />
  <TextField label="Apellido" style={{ flex: 1 }} />
</div>
```

**Después:**
```jsx
<FormRow>
  <TextField label="Nombre" fullWidth />
  <TextField label="Apellido" fullWidth />
</FormRow>
```

### 7. Botones responsive
**Antes:**
```jsx
<div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
  <Button>Guardar</Button>
  <Button>Cancelar</Button>
</div>
```

**Después:**
```jsx
<ButtonGroup>
  <Button variant="contained">Guardar</Button>
  <Button variant="outlined">Cancelar</Button>
</ButtonGroup>
```

### 8. Tablas responsive
**Antes:**
```jsx
<Table>
  <TableHead>
    <TableRow>
      <TableCell style={{ fontWeight: 'bold' }}>Nombre</TableCell>
    </TableRow>
  </TableHead>
</Table>
```

**Después:**
```jsx
<ResponsiveTable>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Nombre</TableCell>
      </TableRow>
    </TableHead>
  </Table>
</ResponsiveTable>
```

## 🎨 Estilos Disponibles

### Containers
- `styles.pageContainer` - Container principal
- `styles.cardContainer` - Card/Paper
- `styles.modalBox` - Modal normal
- `styles.modalBoxLarge` - Modal grande

### Layout
- `styles.pageHeader` - Encabezado de página
- `styles.formContainer` - Container de formulario
- `styles.formRow` - Fila de formulario
- `styles.buttonGroup` - Grupo de botones
- `styles.stackHorizontal` - Stack horizontal→vertical

### Tablas
- `styles.tableContainer` - Wrapper de tabla
- `styles.tableHeader` - Header de tabla
- `styles.tableCellActions` - Celda de acciones
- `styles.actionButton` - Botón pequeño de acción

### Utilidades
- `styles.hideOnMobile` - Ocultar en móvil
- `styles.hideOnDesktop` - Ocultar en desktop
- `styles.truncatedText` - Texto con ellipsis
- `styles.centeredTitle` - Título centrado

## 📐 Breakpoints

```jsx
{
  xs: 0,      // Extra small (móvil vertical)
  sm: 600,    // Small (móvil horizontal, tablet)
  md: 900,    // Medium (tablet horizontal, laptop pequeño)
  lg: 1200,   // Large (desktop)
  xl: 1536    // Extra large (pantallas grandes)
}
```

### Uso:
```jsx
<Box sx={{
  padding: { xs: 1, sm: 2, md: 3 },
  fontSize: { xs: '0.875rem', md: '1rem' },
  display: { xs: 'none', md: 'block' }
}}>
```

## ⚠️ Reglas Importantes

1. **NUNCA usar `style={{}}`** inline - Usar `sx={{}}` o clases CSS
2. **Mobile-first** - Diseñar primero para móvil
3. **Usar componentes wrapper** cuando sea posible
4. **Importar estilos comunes** en lugar de duplicar
5. **fullWidth en TextFields** dentro de FormRow
6. **Evitar anchos fijos** - Usar porcentajes o flex
7. **Probar en diferentes tamaños** antes de commit

## 🚀 Orden de Migración Sugerido

1. ✅ Producto.js (EJEMPLO)
2. MateriasPrima.js
3. Almacen.js
4. Proveedor.js
5. Empresa.js
6. Usuario.js
7. OrdenCompra.js
8. MovimientoInventario.js
9. Dashboard.js
10. SoporteCliente.js
11. Login.js (especial)
12. Componentes (TopBar, SideMenu, etc.)

---

**Autor:** Sistema de migración responsive
**Fecha:** 2025
**Versión:** 1.0
