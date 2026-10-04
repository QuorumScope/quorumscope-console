export function DataError({ title, message }: { title: string; message: string }) {
  return <section className="data-error" role="status"><h2>{title}</h2><p>{message}</p></section>;
}
