INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

--changing account type for user Tony
UPDATE public.account
SET account_type = 'Admin'
WHERE account_id = 1;

-- Deleting user from the databse
DELETE FROM public.account
WHERE account_id = 1;

-- Updating inventory description for GM Hummer using the replace function
UPDATE   public.inventory
SET   inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE   inv_id = 10;

-- Using the inner joing statement in select
SELECT i.inv_make, i.inv_model, c.classification_name
FROM public.inventory i
INNER JOIN public.classification c
ON c.classification_id = i.classification_id
WHERE i.classification_id = 2;

--updating two columns from one table using replace
UPDATE public.inventory
SET inv_image = REPLACE(inv_image, '/images', '/images/vehicles'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images', '/images/vehicles');
