CreativeObjectWorld (cow) using node.js and mongodb

js modules:
jquery and jQuery-UI Mobile for front end.

Not using socket.io as it seemds to add alot of overhead.
Sending json packets between client using ajax.
If no json object found on url then treat it as a static fiel and server it as an http request.

Mongodb info:
Hosted on: MongoHQ.


Cloud9 IDE info:
Kill running node.js process with: kill $(ps ax | grep '[j]s' | awk '{ print $1 }')
Root folder appears to be: /var/lib/stickshift/5334383a5973cae4a6000155/app-root/data/814430


