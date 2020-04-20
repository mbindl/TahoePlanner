# Script: CheckforBrokenData
# Created: by Amy Fish on 2/26/2018
# Purpose: To check all MXDs in a directory and see if that project has any broken data sources
#  Writes the results to a command prompt and emails all broken sources 

print ("Broken Data check process started...")
import arcpy
import os
import smtplib  

def sendResultEmail(msgContents):
        
	to = 'mbindl@trpa.org'
	send_username = 'infosys@trpa.org'
	smtpserver = smtplib.SMTP("mail.smtp2go.com", 25)
 
	subject = 'ArcGIS Services: CheckforBrokenData'
	smtpserver.ehlo()
	smtpserver.starttls()
	
	header = 'To:' + to + '\n' + 'From: ' + send_username + '\n' + 'Subject:' + subject + '\n'
	
	msg = header + '\n The following broken data sources need to be fixed: \n\t' + msgContents + '\n'
	
	smtpserver.sendmail(send_username, to, msg)
	
	arcpy.AddMessage('Results email sent!')
	
	smtpserver.close()


print ("Import complete...")

path = r"C:\mxds\Services"
print "Checking Services for broken data sources: " + path
strResult = ""
iBrokenCount = 0

for fileName in os.listdir(path):
    fullPath = os.path.join(path, fileName)
    if os.path.isfile(fullPath):
        basename, extension = os.path.splitext(fullPath)
        if extension == ".mxd":
            mxd = arcpy.mapping.MapDocument(fullPath)
            print "MXD: " + fileName
            brknList = arcpy.mapping.ListBrokenDataSources(mxd)
            for brknItem in brknList:
                iBrokenCount = iBrokenCount + 1
                try:  
                    brknItem.supports("dataSource")  
                    print "\t" + "Broken Source: " + brknItem.name
                    strResult = strResult + " \n\t " + fileName + ":  " + brknItem.name
                except AttributeError:  
                    #Cannot figure out views... We will ignore these.
                    strResult = strResult + " \n\t " + fileName + ":  " + brknItem.name + " (Double-check views)" 					
                    print "\t" + "Broken Source for View: " + brknItem.name
del mxd

# Now send the email

if (iBrokenCount > 0):
	sendResultEmail(strResult)

