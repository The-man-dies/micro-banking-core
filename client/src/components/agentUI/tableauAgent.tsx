type agentType = {
    code_agents: number;
    nom_prenom: string;
    telephone: number;
    adresse: string;
};
type Props = {
    agents: agentType[];
    setAgents?: React.Dispatch<React.SetStateAction<agentType[]>>; // optionnel si tu veux modifier
};
export default function TableauAgent({ agents }: Props) {
    return (
        <div>
            <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100 mx-auto h-160">
                <table className="table">
                    {/* head */}
                    <thead className="bg-indigo-600">
                        <tr>
                            <th>Code agents</th>
                            <th>Nom Prénom</th>
                            <th>Télephone</th>
                            <th>Adresse</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* row 1 */}
                        {agents.map(data => (
                            <tr key={data.code_agents}>
                                <th>{data.code_agents}</th>
                                <td>{data.nom_prenom}</td>
                                <td>{data.telephone}</td>
                                <td>{data.adresse}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
