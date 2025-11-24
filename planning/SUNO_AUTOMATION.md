# Suno Automation Plan

## Phase 1 – Manual

Operator:
- Reads order
- Generates track
- Uploads file
- Marks delivered
- Sends email

## Phase 2 – Script

processPaidOrders:
- Polls paid  
- Builds prompt  
- Calls Suno (if API open)  
- Uploads files  
- Delivers email  

## Phase 3 – Job Queue

Automated:
- On payment → enqueue job  
- Worker runs Suno generation and uploads  

