# Commission Backend API 🚀

API RESTful para sistema de gestión de comisiones con 3 niveles de jerarquía. Desarrollado con NestJS, TypeORM, PostgreSQL y desplegado en Vercel.

## 📋 Requisitos Cumplidos

### ✅ **Backend Principal**

- [x] APIs RESTful para gestión de participantes y cálculos de comisiones
- [x] Implementar tres niveles de jerarquía: Nivel 1, Nivel 2, Nivel 3
- [x] Calcular comisiones basadas en datos de ventas: Nivel 1 recibe el 10%, Nivel 2 el 5%, y Nivel 3 el 2.5%
- [x] Asegurar las APIs con autenticación JWT
- [x] Diseñar esquema de base de datos para participantes y transacciones

### ✅ **Características Opcionales**

- [x] Implementar autenticación y autorización JWT
- [x] Añadir pruebas unitarias para backend (92% passing)
- [x] Documentar la API con Swagger/OpenAPI
- [x] Desplegar en Vercel

## 🏗️ **Arquitectura**

### **Entidades Principales**

### **Jerarquía de Comisiones**

endedor (Nivel 4) → Comisión 0%
│
└── Referido Nivel 1 → Comisión 10%
│
└── Referido Nivel 2 → Comisión 5%
│
└── Referido Nivel 3 → Comisión 2.5%

## 🚀 **Despliegue Rápido**

## 🚀 **Despliegue Rápido**

### **URLs de Producción**

<!-- ⚠️ REEMPLAZA ESTAS URLS CON LAS TUS ⚠️ -->

- **API Principal**: `https://commission-backend-tu-usuario.vercel.app`
- **Documentación Swagger**: `https://commission-backend-tu-usuario.vercel.app/api`
- **Health Check**: `https://commission-backend-tu-usuario.vercel.app/`

### **Variables de Entorno**

```env
# Vercel Environment Variables
DATABASE_URL=postgresql://tu-usuario:tu-password@tu-host/tu-db
JWT_SECRET=tu-super-secreto-jwt-aqui
NODE_ENV=production
PORT=3001
```
