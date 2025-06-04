import { IconCategory, IconBook, IconSchool, IconCertificate } from '@tabler/icons-react';

const categories = [
  {
    title: 'Academic',
    description: 'Rate and review academic institutions and programs',
    icon: IconSchool,
  },
  {
    title: 'Books',
    description: 'Share your thoughts on books and literature',
    icon: IconBook,
  },
  {
    title: 'Courses',
    description: 'Evaluate online and offline courses',
    icon: IconCategory,
  },
  {
    title: 'Certifications',
    description: 'Review professional certifications and training programs',
    icon: IconCertificate,
  },
];

export default function CategoriesSection() {
  return (
    <section className="w-full py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Browse Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <div
              key={category.title}
              className="p-6 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <category.icon className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
              <p className="text-gray-600">{category.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
