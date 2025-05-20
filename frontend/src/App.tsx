import { ImagePredict } from "./components/ImagePredict";

function App() {
	return (
		<div className="flex flex-col h-screen w-screen items-center justify-center">
			<h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
				Tomato Disease Detection
			</h2>
			<ImagePredict />
		</div>
	);
}

export default App;
