import ScenarioClient from './ScenarioClient';

// Для output: 'export' нужен хотя бы один статический путь
export async function generateStaticParams() {
  return [{id: 'placeholder'}];
}

type Props = {params: {id: string}};

export default function ScenarioPage({params}: Props) {
  return <ScenarioClient id={params.id} />;
}
