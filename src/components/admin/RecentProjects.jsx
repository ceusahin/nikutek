const RecentProjects = ({ projects }) => {
  return (
    <div className="rounded-2xl shadow p-4">
      <h3 className="text-lg font-semibold mb-4">📝 Son Eklenen Projeler</h3>
      <ul className="space-y-2">
        {projects.map((project, index) => (
          <li
            key={index}
            className="border border-gray-300 dark:border-gray-500 p-3 rounded-xl cursor-pointer"
          >
            <p className="font-bold">{project.name}</p>
            <p className="text-sm">
              Başlangıç: {project.startDate} — Durum: {project.status}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentProjects;
