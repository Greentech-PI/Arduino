CREATE USER [usuarioParaAPIArduino_datawriter]
WITH PASSWORD = '#GfgrupoGreentech',
DEFAULT_SCHEMA = dbo;

EXEC sys.sp_addrolemember @rolename = N'db_datawriter', @membername = N'usuarioParaAPIArduino_datawriter'
