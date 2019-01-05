CREATE TABLE IF NOT EXISTS lessons(
   id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
   trainerID INT NOT NULL,
   traineeID INT NOT NULL,
   vitalSigns TEXT NOT NULL,
   timer varchar(11) DEFAULT 0,
   simState TEXT,
   changeDuration TEXT,
   active BIT
   )DEFAULT CHARACTER SET utf8;