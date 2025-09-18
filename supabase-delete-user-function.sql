-- Create a function to delete user and all associated data
-- This function should be run in your Supabase SQL editor

CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Get the current user's ID
    user_id := auth.uid();
    
    -- Check if user is authenticated
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;
    
    -- Delete from custom tables (in order to respect foreign key constraints)
    DELETE FROM subscriptions WHERE user_id = user_id;
    DELETE FROM orders WHERE user_id = user_id;
    DELETE FROM products WHERE user_id = user_id;
    DELETE FROM stores WHERE user_id = user_id;
    DELETE FROM user_profiles WHERE id = user_id;
    
    -- Delete from auth.users (this will cascade to related auth tables)
    DELETE FROM auth.users WHERE id = user_id;
    
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;

-- Optional: Create a trigger to automatically clean up data when a user is deleted
-- This is a backup in case the function doesn't catch everything
CREATE OR REPLACE FUNCTION handle_user_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Clean up any remaining data when a user is deleted from auth.users
    DELETE FROM subscriptions WHERE user_id = OLD.id;
    DELETE FROM orders WHERE user_id = OLD.id;
    DELETE FROM products WHERE user_id = OLD.id;
    DELETE FROM stores WHERE user_id = OLD.id;
    DELETE FROM user_profiles WHERE id = OLD.id;
    
    RETURN OLD;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
    BEFORE DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_user_deletion();
