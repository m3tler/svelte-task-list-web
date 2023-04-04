const options = {
    headers: {
        Authorization: "Basic " + btoa("admin@admin.pl" + ":" + "admin")
    }
}

export async function getTasks(searchParams: Map<string, string>) {
    const params = new URLSearchParams(Array.from(searchParams.entries())).toString();
    return await fetch('http://localhost:8080/tasks?' + params, options).then((response) => {
        if (response.ok) {
            return response.json();
        }
        throw new Error();
        })
        .catch((error) => {
            console.log(error);
        });
}