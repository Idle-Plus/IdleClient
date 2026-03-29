import { FC, useState } from "react";

const PlayerMention: FC<{ name: string }> = ({ name }) => {
	const [valid, setValid] = useState(true);

	const style = valid
		? "bg-ic-light-500/30 hover:bg-ic-light-500 text-ic-light-200 hover:text-ic-light-000"
		: "bg-ic-red-500/30 hover:bg-ic-red-700 text-ic-red-100 hover:text-red-300";

	return (
		<span
			onClick={event => {
				setValid(prevState => !prevState);
			}}
			className={`px-0.75 -mx-0.25 rounded-md transition-colors duration-100 cursor-pointer select-none ${style}`}
		>
			{"@" + name}
		</span>
	)
}

export default PlayerMention;