import { useEffect, useState } from "react";
import { SmartRef } from "./useSmartRef.ts";

const useSmartRefWatcher = <T>(
	ref: SmartRef<T>,
): T => {
	const [_, forceRender] = useState<number>(0);
	const [value, setValue] = useState<T>(ref.content());

	useEffect(() => {
		const id = ref.subscribe(() => {
			setValue(ref.content());
			forceRender(prev => prev + 1);
		});
		return () => ref.unsubscribe(id);
	});

	return value;
};

export default useSmartRefWatcher;