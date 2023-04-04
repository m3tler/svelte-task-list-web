const options = {
	headers: {
		Authorization: 'Basic ' + btoa('admin@admin.pl' + ':' + 'admin')
	}
};

export type Task = {
	id: number;
	name: string;
	done: boolean;
	deadline: string;
};

export async function getTasks(searchParams: Map<string, string>) {
	const params = new URLSearchParams(Array.from(searchParams.entries())).toString();
	return await fetch('http://localhost:8080/tasks?' + params, options);
}

export async function addTask(task: Task) {
	return await fetch('http://localhost:8080/tasks', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: 'Basic ' + btoa('admin@admin.pl' + ':' + 'admin')
		},
		body: JSON.stringify({
			name: task.name,
			done: task.done,
			deadline: new Date(task.deadline)
		})
	});
}

export async function editTask(task: any) {
	return await fetch('http://localhost:8080/tasks/' + task.id, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			Authorization: 'Basic ' + btoa('admin@admin.pl' + ':' + 'admin')
		},
		body: JSON.stringify(task)
	});
}

export async function deleteTasks(ids: number[]) {
	console.log(ids.join(','))
	return await fetch('http://localhost:8080/tasks/' + ids.join(','), {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			Authorization: 'Basic ' + btoa('admin@admin.pl' + ':' + 'admin')
		}
	});
}
