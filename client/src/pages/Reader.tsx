import { useParams } from "react-router-dom"


export default function ReaderPage() {
    const { id } = useParams();
    return (
        <div>
            <h1>Reading article ID: {id}</h1>
        </div>
    )
}