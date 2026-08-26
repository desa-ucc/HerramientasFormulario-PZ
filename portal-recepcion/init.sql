-- ========================================================
-- Script de Inicialización de Base de Datos - Portal de Recepción
-- Motor: SQL Server
-- ========================================================

-- Crear base de datos (Opcional si ya existe, comentado por seguridad en algunos entornos)
-- CREATE DATABASE PortalRecepcion;
-- GO
-- USE PortalRecepcion;
-- GO

-- 1. Crear la tabla de auditoría (RegistroArchivos)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='RegistroArchivos' and xtype='U')
BEGIN
    CREATE TABLE RegistroArchivos (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Nombre NVARCHAR(100) NOT NULL,
        Apellidos NVARCHAR(150) NOT NULL,
        NombreArchivo NVARCHAR(255) NOT NULL,
        FechaCarga DATETIME DEFAULT GETDATE(),
        Estado NVARCHAR(50) DEFAULT 'Pendiente'
    );
END
GO

-- 2. Crear una vista optimizada para lectura
-- Esta vista puede usarse para reportes y listados sin afectar la tabla principal
CREATE OR ALTER VIEW vw_RegistroArchivos
AS
SELECT
    Id,
    Nombre,
    Apellidos,
    NombreArchivo,
    FechaCarga,
    Estado
FROM
    RegistroArchivos WITH (NOLOCK); -- NOLOCK para lecturas sin bloqueo
GO

-- 3. Crear el Procedimiento Almacenado robusto para la inserción
-- Este SP será llamado por n8n o la aplicación
CREATE OR ALTER PROCEDURE sp_InsertarRegistroArchivo
    @Nombre NVARCHAR(100),
    @Apellidos NVARCHAR(150),
    @NombreArchivo NVARCHAR(255),
    @Estado NVARCHAR(50) = 'Completado'
AS
BEGIN
    -- SET NOCOUNT ON optimiza el rendimiento evitando el envío de mensajes de filas afectadas
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        INSERT INTO RegistroArchivos (Nombre, Apellidos, NombreArchivo, Estado, FechaCarga)
        VALUES (@Nombre, @Apellidos, @NombreArchivo, @Estado, GETDATE());

        -- Retornar el ID del registro insertado (útil para auditoría en n8n)
        SELECT SCOPE_IDENTITY() AS InsertedId;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        -- Manejo de errores
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        -- Relanzar el error
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();

        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO
