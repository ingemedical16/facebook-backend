import User from "../models/user/User";
/**
 * 
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} username - User name
 */
export const autoGenerateUsername = async (firstName: string, lastName: string): Promise<string> => {
    // Remove spaces from firstName and lastName
    const cleanFirstName = firstName.replace(/\s/g, "");
    const cleanLastName = lastName.replace(/\s/g, "");

    const username = `${cleanFirstName.toLowerCase()}${cleanLastName.toLowerCase()}${Date.now().toString().slice(-5)}`;

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
        return autoGenerateUsername(cleanFirstName, cleanLastName);
    }
    
    return username;
};
