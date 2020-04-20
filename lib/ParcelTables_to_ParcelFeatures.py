## This script updates parcel specific feature classes for BMPs, LCVs, LCCs, Historic Parcels,
# Import system modules
import pandas as pd
import pyodbc
import arcpy
from arcgis.features import GeoAccessor, GeoSeriesAccessor
from datetime import datetime

# set workspace and sde connections
sdeBase = "F:\\GIS\\GIS_DATA\\Vector.sde"

# start timer
startTimer = datetime.now()

# name of feature class
name = "Parcel_BMP"
# specify output feature class
outFC = '//Arcprod/C$/GISData/PermitReview_AppData.gdb/' + name
# outFC = "C:\\GIS\\PROJECT\\ScratchPaper\\ScratchPaper.gdb\\" + name

# make sql database connection with pyodbc
conn = pyodbc.connect('DRIVER={ODBC Driver 17 for SQL Server};SERVER=sql14;DATABASE=tahoebmpsde;UID=sde;PWD=staff')

# create dataframe from sql query
dfSQL = pd.read_sql("SELECT * FROM tahoebmpsde.dbo.v_BMPStatus", conn)

# specify sde connection file
sdeBase = "C:\\GIS\\DB_CONNECT\\Vector.sde"

# create spatial dataframe from parcels in sde
parcels = sdeBase + "\\sde.SDE.Parcels\\sde.SDE.Parcels_Base"
sdfParcels = pd.DataFrame.spatial.from_featureclass(parcels)

# merge parcels and sql table on APN
df = pd.merge(sdfParcels, dfSQL, on='APN', how='inner')

# specify fields to keep
dfOut = df[['APN',
            'JURISDICTION',
            'CertificateIssued',
            'EvaluationComplete',
            'SourceCertIssued',
            'CertDate',
            'CertReissuedDate',
            'LandUse',
            'BMPStatus',
            'Catchment',
            'SourceCertDate',
            'SiteConstraint',
            'CreditPercent',
            'AreaWide',
            'CreditArea',
            'TMDL_LandUse',
            'CertNo',
            'SHAPE'
            ]].copy()

# delete output fc if exists
if arcpy.Exists(outFC):
    arcpy.Delete_management(outFC)

# spaital dataframe to feature class
dfOut.spatial.to_featureclass(outFC)

# confirm feature class was created
print("\nUpdated " + outFC)

# report how long it took to run the script
endTimer = datetime.now() - startTimer
print("\nTime it took to run this script: {}".format(endTimer))

# -------------------------------------------------------------- #

# start timer
startTimer = datetime.now()

# name of feature class
name = "Parcel_LCV"
# specify output feature class
outFC = '//Arcprod/C$/GISData/PermitReview_AppData.gdb/' + name
# outFC = "C:\\GIS\\PROJECT\\ScratchPaper\\ScratchPaper.gdb\\" + name


# make sql database connection with pyodbc
conn = pyodbc.connect(
    'DRIVER={ODBC Driver 17 for SQL Server};SERVER=ASQL;DATABASE=Accela;UID=BMP_Update;PWD=BMP_update_123')

# create dataframe from sql query
dfSQL = pd.read_sql("SELECT * FROM Accela.dbo.v_LandCapabilityVerifications", conn)

# specify sde connection file
sdeBase = "C:\\GIS\\DB_CONNECT\\Vector.sde"

# create spatial dataframe from parcels in sde
parcels = sdeBase + "\\sde.SDE.Parcels\\sde.SDE.Parcels_Base"
sdfParcels = pd.DataFrame.spatial.from_featureclass(parcels)

# merge parcels and sql table on APN
df = pd.merge(sdfParcels, dfSQL, left_on='APN', right_on='GIS_ID', how='inner')

# rename some of the fields
df.rename(columns={"LABEL_FIELD": "Status"}, inplace=True)

# specify fields to keep
dfOut = df[["APN", "Status", "SHAPE"]].copy()

# delete output fc if exists
if arcpy.Exists(outFC):
    arcpy.Delete_management(outFC)

# spaital dataframe to feature class
dfOut.spatial.to_featureclass(outFC)

# confirm feature class was created
print("\nUpdated " + outFC)

# report how long it took to run the script
endTimer = datetime.now() - startTimer
print("\nTime it took to run this script: {}".format(endTimer))

# -------------------------------------------------------------- #

# start timer
startTimer = datetime.now()

# name of feature class
name = "Parcel_LCV_Challenge"
# specify output feature class
outFC = '//Arcprod/C$/GISData/PermitReview_AppData.gdb/' + name
# outFC = "C:\\GIS\\PROJECT\\ScratchPaper\\ScratchPaper.gdb\\" + name

# make sql database connection with pyodbc
conn = pyodbc.connect(
    'DRIVER={ODBC Driver 17 for SQL Server};SERVER=ASQL;DATABASE=Accela;UID=BMP_Update;PWD=BMP_update_123')

# create dataframe from sql query
dfSQL = pd.read_sql("SELECT * FROM Accela.dbo.v_LandCapabilityChallenges", conn)

# specify sde connection file
sdeBase = "F:\\GIS\\GIS_DATA\\Vector.sde"

# create spatial dataframe from parcels in sde
parcels = sdeBase + "\\sde.SDE.Parcels\\sde.SDE.Parcels_Base"
sdfParcels = pd.DataFrame.spatial.from_featureclass(parcels)

# merge parcels and sql table on APN
df = pd.merge(sdfParcels, dfSQL, left_on='APN', right_on='GIS_ID', how='inner')

# rename some of the fields
df.rename(columns={"REC_DATE": "Date", "LABEL_FIELD": "Status"}, inplace=True)

# specify fields to keep
dfOut = df[["APN", "Date", "Status", "SHAPE"]].copy()

# delete output fc if exists
if arcpy.Exists(outFC):
    arcpy.Delete_management(outFC)

# spaital dataframe to feature class
dfOut.spatial.to_featureclass(outFC)

# confirm feature class was created
print("\nUpdated " + outFC)

# report how long it took to run the script
endTimer = datetime.now() - startTimer
print("\nTime it took to run this script: {}".format(endTimer))

# --------------------------------------------------------------- #

# start timer
startTimer = datetime.now()

# name of feature class
name = "Parcel_SoilsHydro"
# specify output feature class
outFC = '//Arcprod/C$/GISData/PermitReview_AppData.gdb/' + name
# outFC = "C:\\GIS\\PROJECT\\ScratchPaper\\ScratchPaper.gdb\\" + name

# make sql database connection with pyodbc
conn = pyodbc.connect(
    'DRIVER={ODBC Driver 17 for SQL Server};SERVER=ASQL;DATABASE=Accela;UID=BMP_Update;PWD=BMP_update_123')

# create dataframe from sql query
dfSQL = pd.read_sql("SELECT * FROM Accela.dbo.v_HydroSoilsProjects", conn)

# specify sde connection file
sdeBase = "F:\\GIS\\GIS_DATA\\Vector.sde"

# create spatial dataframe from parcels in sde
parcels = sdeBase + "\\sde.SDE.Parcels\\sde.SDE.Parcels_Base"
sdfParcels = pd.DataFrame.spatial.from_featureclass(parcels)

# merge parcels and sql table on APN
df = pd.merge(sdfParcels, dfSQL, left_on='APN', right_on='GIS_ID', how='inner')

# rename some of the fields
df.rename(columns={"REC_DATE": "Date", "LABEL_FIELD": "Status"}, inplace=True)

# specify fields to keep
dfOut = df[["APN", "Date", "Status", "SHAPE"]].copy()

# delete output fc if exists
if arcpy.Exists(outFC):
    arcpy.Delete_management(outFC)

# spaital dataframe to feature class
dfOut.spatial.to_featureclass(outFC)

# confirm feature class was created
print("\nUpdated " + outFC)

# report how long it took to run the script
endTimer = datetime.now() - startTimer
print("\nTime it took to run this script: {}".format(endTimer))