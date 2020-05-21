#!/bin/bash

## Create new user and import sample database

# mysql -u root -p << EOF

# CREATE USER 'user'@'localhost' IDENTIFIED BY '';
# CREATE USER 'user'@'%' IDENTIFIED BY '';
# GRANT ALL ON *.* TO 'user'@'localhost';
# GRANT ALL ON *.* TO 'user'@'%';
# flush privileges;
# exit
# EOF

mysql -u root -p123 < db.sql
mysql -u root -p123 < dummyData.sql
