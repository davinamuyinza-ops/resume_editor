import EditorLayout from "./components/EditorLayout.jsx";
import EntryScreen from "./components/EntryScreen.jsx";
import { useResumeStore } from "./store/resumeStore.js";

export default function App() {
    const resume = useResumeStore((state) => state.resume);

    if (!resume) {
        return <EntryScreen />;
    }

    return <EditorLayout />;
}
