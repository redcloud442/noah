-- Set schema search path to ensure correct table targeting
SET search_path = user_schema, product_schema, order_schema, public;

-- Insert sample users into user_table
INSERT INTO user_schema.user_table (user_id, user_name, user_email, user_password, user_profile_picture,user_updated_at)
VALUES 
  (gen_random_uuid(), 'John Doe', 'john.doe@example.com', 'password123', 'https://example.com/johndoe.jpg','2025-02-09 08:29:05.529'),
  (gen_random_uuid(), 'Jane Smith', 'jane.smith@example.com', 'password456', 'https://example.com/janesmith.jpg','2025-02-09 08:29:05.529'),
  (gen_random_uuid(), 'Michael Johnson', 'michael.johnson@example.com', 'password789', 'https://example.com/michaeljohnson.jpg','2025-02-09 08:29:05.529'),
  (gen_random_uuid(), 'Emily Davis', 'emily.davis@example.com', 'password101', 'https://example.com/emilydavis.jpg','2025-02-09 08:29:05.529'),
  (gen_random_uuid(), 'Sarah Wilson', 'sarah.wilson@example.com', 'password102', 'https://example.com/sarahwilson.jpg','2025-02-09 08:29:05.529');

-- Insert sample addresses into user_address_table
INSERT INTO user_schema.user_address_table (user_address_id, user_address_name, user_address_phone, user_address_address, user_address_city, user_address_state, user_address_postal_code, user_address_user_id)
VALUES 
  (gen_random_uuid(), 'John Home', '1234567890', '123 Main St', 'New York', 'NY', '10001', (SELECT user_id FROM user_schema.user_table WHERE user_name = 'John Doe')),
  (gen_random_uuid(), 'Jane Office', '0987654321', '456 Elm St', 'Los Angeles', 'CA', '90001', (SELECT user_id FROM user_schema.user_table WHERE user_name = 'Jane Smith')),
  (gen_random_uuid(), 'Michael Apt', '5554443333', '789 Pine St', 'Chicago', 'IL', '60614', (SELECT user_id FROM user_schema.user_table WHERE user_name = 'Michael Johnson')),
  (gen_random_uuid(), 'Emily Home', '2223334444', '101 Maple Ave', 'Houston', 'TX', '77002', (SELECT user_id FROM user_schema.user_table WHERE user_name = 'Emily Davis')),
  (gen_random_uuid(), 'Sarah Condo', '9998887777', '202 Oak St', 'Miami', 'FL', '33101', (SELECT user_id FROM user_schema.user_table WHERE user_name = 'Sarah Wilson'));

-- Insert sample product categories into product_category_table
INSERT INTO product_schema.product_category_table (product_category_id, product_category_name, product_category_description)
VALUES 
  (gen_random_uuid(), 'Electronics', 'Electronic devices and gadgets'),
  (gen_random_uuid(), 'Clothing', 'Apparel, accessories, and shoes'),
  (gen_random_uuid(), 'Home Appliances', 'Appliances for home and kitchen use'),
  (gen_random_uuid(), 'Books', 'Printed and digital books across various genres'),
  (gen_random_uuid(), 'Sports', 'Sports equipment and accessories');

-- Insert sample products into product_table
INSERT INTO product_schema.product_table (product_id, product_name, product_description, product_price, product_category_id)
VALUES 
  (gen_random_uuid(), 'Smartphone', 'A high-end smartphone with 128GB storage', 699, (SELECT product_category_id FROM product_schema.product_category_table WHERE product_category_name = 'Electronics')),
  (gen_random_uuid(), 'Laptop', 'A powerful laptop with 16GB RAM', 999, (SELECT product_category_id FROM product_schema.product_category_table WHERE product_category_name = 'Electronics')),
  (gen_random_uuid(), 'T-Shirt', 'A comfortable cotton t-shirt', 29, (SELECT product_category_id FROM product_schema.product_category_table WHERE product_category_name = 'Clothing')),
  (gen_random_uuid(), 'Microwave', 'A compact microwave for quick meals', 150, (SELECT product_category_id FROM product_schema.product_category_table WHERE product_category_name = 'Home Appliances')),
  (gen_random_uuid(), 'Running Shoes', 'Lightweight running shoes for daily use', 75, (SELECT product_category_id FROM product_schema.product_category_table WHERE product_category_name = 'Sports'));

-- Insert sample cart items into cart_table
INSERT INTO order_schema.cart_table (cart_id, cart_user_id, cart_product_id, cart_quantity)
VALUES 
  (gen_random_uuid(), (SELECT user_id FROM user_schema.user_table WHERE user_name = 'John Doe'), (SELECT product_id FROM product_schema.product_table WHERE product_name = 'Smartphone'), 1),
  (gen_random_uuid(), (SELECT user_id FROM user_schema.user_table WHERE user_name = 'Jane Smith'), (SELECT product_id FROM product_schema.product_table WHERE product_name = 'T-Shirt'), 2),
  (gen_random_uuid(), (SELECT user_id FROM user_schema.user_table WHERE user_name = 'Michael Johnson'), (SELECT product_id FROM product_schema.product_table WHERE product_name = 'Laptop'), 1),
  (gen_random_uuid(), (SELECT user_id FROM user_schema.user_table WHERE user_name = 'Emily Davis'), (SELECT product_id FROM product_schema.product_table WHERE product_name = 'Microwave'), 1),
  (gen_random_uuid(), (SELECT user_id FROM user_schema.user_table WHERE user_name = 'Sarah Wilson'), (SELECT product_id FROM product_schema.product_table WHERE product_name = 'Running Shoes'), 2);
