#!/bin/bash -xe

DEPLOYDATE=$(date '+%d.%m.%Y')
DEPLOYHOUR=$(date '+%H:%M:%S')
DEPLOYED="$DEPLOYDATE @ $DEPLOYHOUR CEST"

sed -e "s+https:\/\/localhost:4200+$HOST+g" -e "s/This is a date/$DEPLOYED/g" src/assets/env/env.js > dist/assets/env/env.js

NOW=$(date '+%Y%m%d%H%M%S')
folder="/var/www/$NAME/$NOW"
current="/var/www/$NAME/current"
ssh -o StrictHostKeyChecking=no userinterface@$NAME -C "mkdir ${folder}"
scp -o StrictHostKeyChecking=no -r dist/* userinterface@$NAME:$folder
ssh -o StrictHostKeyChecking=no userinterface@$NAME -C "ln -sfn $folder $current"
