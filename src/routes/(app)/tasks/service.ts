const options = {
	headers: {
		Authorization: 'Basic ' + btoa('admin@admin.pl' + ':' + 'admin')
	}
};

export type Task = {
	id: number;
	name: string;
	done: boolean;
	deadline: Date;
};

export async function getTasks(searchParams: Map<string, string>) {
	const params = new URLSearchParams(Array.from(searchParams.entries())).toString();
	return await fetch('http://localhost:8080/tasks?' + params, options)
		.then((response) => {
			if (response.ok) {
				return response.json();
			}
			throw new Error();
		})
		.catch((error) => {
			console.log(error);
		});
}

export async function saveTask(task: Task) {
	return await fetch('http://localhost:8080/tasks/' + task.id, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			Authorization: 'Basic ' + btoa('admin@admin.pl' + ':' + 'admin')
		},
		body: JSON.stringify(task)
	}).catch((error) => {
		console.log(error);
	});
}

export async function deleteTasks(ids: number[]) {
	return await fetch('http://localhost:8080/tasks/' + ids.join(','), {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			Authorization: 'Basic ' + btoa('admin@admin.pl' + ':' + 'admin')
		}
	}).catch((error) => {
		console.log(error);
	});
}

export async function addTask(task: any) {
	return await fetch('http://localhost:8080/tasks', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: 'Basic ' + btoa('admin@admin.pl' + ':' + 'admin')
		},
		body: JSON.stringify(task)
	}).catch((error) => {
		console.log(error);
	});
}
