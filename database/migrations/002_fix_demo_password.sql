USE paymint;

UPDATE users
SET password = '$2b$10$K2a385j5PRx8al8q/6ZzwOM/kCpCshWWZZj5PAD8Flw9bzevh1vX6'
WHERE email = 'demo@paymint.test';
