import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TaskType } from "@idleclient/network/NetworkData.ts";
import BasicTaskPage from "@pages/game/task/pages/BasicTaskPage.tsx";

const TaskPage: React.FC = () => {
	const navigate = useNavigate();
	const { name } = useParams<{ name: string }>();

	if (!name) return null;

	const type = Object.entries(TaskType)
		.find(entry => (entry[1] as string).toLowerCase() === name.toLowerCase())
		?.map(entry => TaskType[(entry as string) as keyof typeof TaskType])
		.pop()

	if (type === undefined || type === TaskType.None) {
		navigate("/game");
		return;
	}

	return (
		<BasicTaskPage type={type} />
	);
};

export default TaskPage;