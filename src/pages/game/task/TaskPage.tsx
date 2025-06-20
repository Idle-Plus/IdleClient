import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TaskType } from "@idleclient/network/NetworkData.ts";
import BasicTaskPage from "@pages/game/task/pages/BasicTaskPage.tsx";

const TaskPage: React.FC = () => {
	const navigate = useNavigate();
	const { name } = useParams<{ name: string }>();

	if (!name) return null;

	const typeKey = name.charAt(0).toUpperCase() + name.slice(1);
	const type = TaskType[typeKey as keyof typeof TaskType];

	if (type === undefined || type === TaskType.None) {
		navigate("/game");
		return;
	}

	return (
		<BasicTaskPage type={type} />
	);
};

export default TaskPage;