## This script updates parcel specific feature classes LTinfo Data Sources
# Import system modules
import pandas as pd
import pyodbc
import pickle
# import arcpy
# from arcgis.features import GeoAccessor, GeoSeriesAccessor
# from datetime import datetime

# create dataframes from https://qa.laketahoeinfo.org/WebServices/List
dfParcel    = pd.read_json("https://laketahoeinfo.org/WebServices/GetAllParcels/JSON/e17aeb86-85e3-4260-83fd-a2b32501c476")
dfIPES      = pd.read_json("https://laketahoeinfo.org/WebServices/GetParcelIPESScores/JSON/e17aeb86-85e3-4260-83fd-a2b32501c476")
dfLCV       = pd.read_json("https://laketahoeinfo.org/WebServices/GetParcelsByLandCapability/JSON/e17aeb86-85e3-4260-83fd-a2b32501c476")

# dump pickle of merged dataframe
with open(r"C:\GIS\PROJECT\DevelopmentPotential\Data\Pickles\dfParcel.pickle", 'wb') as f:
    pickle.dump(dfParcel, f)

# dump pickle of merged dataframe
with open(r"C:\GIS\PROJECT\DevelopmentPotential\Data\Pickles\IPES.pickle", 'wb') as f:
    pickle.dump(dfIPES, f)

# dump pickle of merged dataframe
with open(r"C:\GIS\PROJECT\DevelopmentPotential\Data\Pickles\LCV.pickle", 'wb') as f:
    pickle.dump(dfLCV, f)

# df.to_csv('C:\GIS\PROJECT\DevelopmentPotential\LTinfo.csv')