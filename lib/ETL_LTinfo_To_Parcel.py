"""
BMP_LandUse_To_ParcelCollect.py
March 13th, 2020
Mason Bindl, Tahoe Regional Planning Agency

This python script was developed to extract verified land use
values from the BMP database, transfer them to the Parcel_Collect
feature class in Collection SDE, then transfer all the land use values
from that dataset to Parcel_Master in Production SDE.

This script uses Python 3.x and was designed to be used with 
the default ArcGIS Pro python enivorment "arcgispro-py3", with
no need for installing new libraries.

"""
# import modules



## This script updates parcel specific feature classes LTinfo Data Sources
# Import system modules
import pandas as pd
import arcpy
import os
import pyodbc
import pickle
import arcpy
from arcgis.features import GeoAccessor, GeoSeriesAccessor
from datetime import datetime


# create dataframes from https://qa.laketahoeinfo.org/WebServices/List
dfLTAPN    = pd.read_json("https://laketahoeinfo.org/WebServices/GetAllParcels/JSON/e17aeb86-85e3-4260-83fd-a2b32501c476")
dfIPES     = pd.read_json("https://laketahoeinfo.org/WebServices/GetParcelIPESScores/JSON/e17aeb86-85e3-4260-83fd-a2b32501c476")
dfLCV      = pd.read_json("https://laketahoeinfo.org/WebServices/GetParcelsByLandCapability/JSON/e17aeb86-85e3-4260-83fd-a2b32501c476")
dfDevBank  = pd.read_json("https://laketahoeinfo.org/WebServices/GetBankedDevelopmentRights/JSON/e17aeb86-85e3-4260-83fd-a2b32501c476")

# # dump pickle of merged dataframe
# with open(r"C:\GIS\PROJECT\DevelopmentPotential\Data\Pickles\dfParcel.pickle", 'wb') as f:
#     pickle.dump(dfParcel, f)

# # dump pickle of merged dataframe
# with open(r"C:\GIS\PROJECT\DevelopmentPotential\Data\Pickles\IPES.pickle", 'wb') as f:
#     pickle.dump(dfIPES, f)

# # dump pickle of merged dataframe
# with open(r"C:\GIS\PROJECT\DevelopmentPotential\Data\Pickles\LCV.pickle", 'wb') as f:
#     pickle.dump(dfLCV, f)

# df.to_csv('C:\GIS\PROJECT\DevelopmentPotential\LTinfo.csv')

# load pickle from dataframe
with open(r"C:\GIS\PROJECT\DevelopmentPotential\Data\Pickles\dfParcel.pickle", 'rb') as f:
    dfParcel = pickle.load(f)

# load pickle from dataframe
with open(r"C:\GIS\PROJECT\DevelopmentPotential\Data\Pickles\dfIPES.pickle", 'rb') as f:
    dfIPES = pickle.load(f)

# load pickle from dataframe
with open(r"C:\GIS\PROJECT\DevelopmentPotential\Data\Pickles\dfLCV.pickle", 'rb') as f:
    dfLCV = pickle.load(f)

# load pickle from dataframe
with open(r"C:\GIS\PROJECT\DevelopmentPotential\Data\Pickles\dfDevRights.pickle", 'rb') as f:
    dfLCV = pickle.load(f)



# overwrite outputs to true
arcpy.env.overwriteOutput = True

# in memory output file path
wk_memory = "in_memory" + "\\"

# network path to connection files
filePath = "C:\\GIS\\DBConnections"

# database file path 
sdeBase = os.path.join(filePath, "Vector.sde")
sdeCollectSDE = os.path.join(filePath, "Collection_SDE.sde")
sdeCollectBMP = os.path.join(filePath, "Collection_BMP.sde")
bmpDB = os.path.join(filePath, "BMP.sde")

# BMP Land use table
bmpLU =  bmpDB + "\\tahoebmpsde.dbo.v_BMPStatus"

# parcel feature classes to get updated
parcelMaster = sdeBase + "\\sde.SDE.Parcels\\sde.SDE.Parcel_Master"
parcelSimple = sdeBase + "\\sde.SDE.Parcels\\sde.SDE.Parcels_Simplified"

# feature dataset path
landuseFD = "sde_collection.SDE.LandUse"

# feature dataset variable using db owner credentials to unregister and register versions
featureDataset = os.path.join(sdeCollectSDE, landuseFD)

# path to feature class using "BMP_UPDATE" db credentials
parcelCollect = os.path.join(sdeCollectBMP, landuseFD, "sde_collection.SDE.Parcel_Collection")

# function to transfer data
def fieldJoinCalc(updateFC, updateFieldsList, sourceFC, sourceFieldsList, sqlWhere):
    from time import strftime  
    print ("Started data transfer: " + strftime("%Y-%m-%d %H:%M:%S"))
    # Use list comprehension to build a dictionary from a da SearchCursor  
    valueDict = {r[0]:(r[1:]) for r in arcpy.da.SearchCursor(sourceFC, sourceFieldsList, where_clause = sqlWhere)}  
    print ("transfering...")
    with arcpy.da.UpdateCursor(updateFC, updateFieldsList) as updateRows:  
        for updateRow in updateRows:  
            # store the Join value of the row being updated in a keyValue variable  
            keyValue = updateRow[0]  
            # verify that the keyValue is in the Dictionary  
            if keyValue in valueDict:  
                # transfer the value stored under the keyValue from the dictionary to the updated field.  
                updateRow[1] = valueDict[keyValue][0]  
                updateRows.updateRow(updateRow)    
    del valueDict  
    print ("Finished data transfer: " + strftime("%Y-%m-%d %H:%M:%S"))

# start an edit session to apply changes to Parcel Master
edit = arcpy.da.Editor(sdeCollectSDE)
print ("edit created")

try:
    # unregister feature dataset as versioned using SDE credentials
    arcpy.UnregisterAsVersioned_management(featureDataset,"NO_KEEP_EDIT","COMPRESS_DEFAULT")
    print("feature dataset unregistered")
    # start an edit session
    edit.startEditing()
    print("edit started")
    edit.startOperation()
    print("operation started")
    # Perform edits
    ## transfer bmp land use values to parcel collect
    fieldJoinCalc(parcelCollect, ['APN', 'TRPA_LANDUSE_DESCRIPTION'], bmpLU, ['APN', 'LANDUSE'], "BMPStatus = 'BMP'")
    print("The 'TRPA_LANDUSE_DESCRIPTION' field in the parcel collection data has been updated")
    # stop edits
    edit.stopOperation()
    print("operation stopped")
    edit.stopEditing(True)  ## Stop the edit session with True to save the changes
    print("edit stopped")
    # register feature dataset as versioned using SDE credentials
    arcpy.RegisterAsVersioned_management(featureDataset, "EDITS_TO_BASE")
except Exception as err:
    print(err)
    if edit.isEditing:
        edit.stopOperation()
        print("operation stopped in except")
        edit.stopEditing(False)  ## Stop the edit session with False to abandon the changes
        print("edit stopped in except")
finally:
    # Cleanup
    arcpy.ClearWorkspaceCache_management()