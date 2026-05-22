USE paymint;

INSERT INTO users (id, name, email, password, business_name, phone)
VALUES
  (1, 'Demo User', 'demo@paymint.test', '$2b$10$K2a385j5PRx8al8q/6ZzwOM/kCpCshWWZZj5PAD8Flw9bzevh1vX6', 'Paymint Studio', '+1 555 0101')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  email = VALUES(email),
  password = VALUES(password),
  business_name = VALUES(business_name),
  phone = VALUES(phone);

INSERT INTO clients (id, user_id, name, company_name, email, phone, address)
VALUES
  (1, 1, 'Nora Wilson', 'Northstar Labs', 'nora@northstar.test', '+1 555 0134', '201 Market Street, Austin, TX'),
  (2, 1, 'Ari Khan', 'Blue Harbor Co.', 'ari@blueharbor.test', '+1 555 0177', '88 Lake Road, Seattle, WA')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO products (id, user_id, name, price, description, sku, quantity)
VALUES
  (1, 1, 'Product Strategy Session', 250.00, 'One-hour billing strategy consultation.', 'PMT-SVC-001', 100),
  (2, 1, 'Invoice Automation Setup', 900.00, 'Workflow setup for recurring invoice operations.', 'PMT-SVC-002', 25)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO invoices (id, user_id, client_id, invoice_number, status, subtotal, tax, discount, total_amount, invoice_date, due_date, currency, notes)
VALUES
  (1, 1, 1, 'PMT-2026-0001', 'Pending', 1150.00, 92.00, 50.00, 1192.00, '2026-05-22', '2026-06-05', 'USD', 'Thank you for your business.')
ON DUPLICATE KEY UPDATE status = VALUES(status);

DELETE FROM invoice_items WHERE invoice_id = 1;

INSERT INTO invoice_items (invoice_id, product_id, item_name, quantity, price, subtotal)
VALUES
  (1, 1, 'Product Strategy Session', 1, 250.00, 250.00),
  (1, 2, 'Invoice Automation Setup', 1, 900.00, 900.00);
