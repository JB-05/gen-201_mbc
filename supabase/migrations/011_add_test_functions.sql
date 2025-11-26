-- Add test functions for debugging

-- Function to get table columns
CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
RETURNS TABLE(column_name text, data_type text)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.column_name::text,
        c.data_type::text
    FROM information_schema.columns c
    WHERE c.table_name = get_table_columns.table_name
    AND c.table_schema = 'public'
    ORDER BY c.ordinal_position;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_table_columns(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_columns(text) TO public;
