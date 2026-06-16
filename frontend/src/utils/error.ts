const cleanMessage = (message: string) => {
        return message.replace(/^Value error,\s*/i, "");
    };

export function getErrorMessage(errorData: any) {
    if(typeof errorData.detail === "string") {
        return errorData.detail;
    }

    if(Array.isArray(errorData.detail)) {
        return errorData.detail
            .map((error: any) => cleanMessage(error.msg))
            .join(" ");
    }

    return "Something went wrong.";
};
