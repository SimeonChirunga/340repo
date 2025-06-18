const pool = require("../database")

/* *****************************
 * Get Message by message_to Id
 * ***************************** */
async function getMessage(message_to) {
    try {
        const result = await pool.query('SELECT * FROM public.message AS i JOIN public.account AS c ON i.message_from = c.account_id WHERE i.message_to=$1', [message_to])
        return result.rows
    } catch (error) {
        console.error("Model error " + error)
    }
}

/* ***************************
 *  Get all account data
 * ************************** */
async function getAllAccountData() {
    return await pool.query("SELECT * FROM public.account")
}

/* ***************************
 *  Add New Message
 * ************************** */
async function addNewMessage(message_to, message_subject, message_body, account_id) {
    try {
        const sql = "INSERT INTO public.message (message_to, message_subject, message_body, message_from) VALUES ($1, $2, $3, $4) RETURNING *"
        return await pool.query(sql, [message_to, message_subject, message_body, account_id])
    } catch (error) {
        return error.message
    }
}

/* *****************************
 * Get Message by message_id
 * ***************************** */
async function getMessageById(message_id, account_id) {
    try {
        // Validate input parameters
        if (!message_id || !account_id) {
            throw new Error("Missing required parameters: message_id and account_id must be provided");
        }

        const sql = `
            SELECT 
                m.*, 
                a.account_firstname, 
                a.account_lastname,
                a.account_email
            FROM 
                public.message AS m
            JOIN 
                public.account AS a ON m.message_from = a.account_id 
            WHERE 
                m.message_id = $1
            AND
                m.message_to = $2
            
        `;

        
        const result = await pool.query(sql, [message_id, account_id]);
        console.log(result.rows[0])

        if (result.rows.length === 0) {
            return null; // or throw new Error("Message not found or access denied");
        }

        return result.rows[0]; // Return single object instead of array since we're querying by ID

    } catch (error) {
        console.error("Model error in getMessageById:", error);
        throw error; // Re-throw the error to be handled by the caller
    }
}


/* *****************************
 * Mark message as read
 * ***************************** */
async function messageRead(message_id) {
    try {
    const sql = "UPDATE public.message SET message_read = TRUE WHERE message_id=$1 RETURNING *"
    const data = await pool.query(sql, [message_id])
    return data
    } catch (error) {
        console.error("Model error " + error)
    }
}

/* *****************************
 * Archive message
 * ***************************** */
async function archiveMessage(message_id) {
    try {
    const sql = "UPDATE public.message SET message_archived = TRUE WHERE message_id=$1 RETURNING *"
    const data = await pool.query(sql, [message_id])
    return data
    } catch (error) {
        console.error("Model error " + error)
    }
}

/* *****************************
 * Delete message
 * ***************************** */
async function deleteMessage(message_id) {
    try {
    const sql = "DELETE FROM public.message WHERE message_id=$1"
    const data = await pool.query(sql, [message_id])
    return data
    } catch (error) {
        console.error("Model error " + error)
    }
}

module.exports = {
    getMessage,
    getAllAccountData,
    addNewMessage,
    getMessageById,
    messageRead,
    archiveMessage,
    deleteMessage
}