"use client";

interface ExampleProps {
  title: string;
  description: string;
}

export default function Example({ title, description }: ExampleProps) {
  return (
    <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

