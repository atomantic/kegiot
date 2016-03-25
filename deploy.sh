kegiot_IP=10.195.15.182

scp -r app/server/app.js root@$kegiot_IP:/opt/kegiot/app/server/;
scp -r app/server/lib root@$kegiot_IP:/opt/kegiot/app/server/;
scp -r app/server/api root@$kegiot_IP:/opt/kegiot/app/server/;
scp -r app/server/views root@$kegiot_IP:/opt/kegiot/app/server/;
scp -r app/client root@$kegiot_IP:/opt/kegiot/app/;
scp -r app/public/views root@$kegiot_IP:/opt/kegiot/app/public;
scp -r app/public/js root@$kegiot_IP:/opt/kegiot/app/public;
