import { IconStar, IconUsers, IconMessage, IconChartBar } from '@tabler/icons-react';

const features = [
  {
    title: 'Smart Ratings',
    description: 'Our AI-powered rating system ensures fair and accurate evaluations',
    icon: IconStar,
  },
  {
    title: 'Community Driven',
    description: 'Join a community of learners and educators sharing their experiences',
    icon: IconUsers,
  },
  {
    title: 'Detailed Reviews',
    description: 'Write and read comprehensive reviews with specific criteria',
    icon: IconMessage,
  },
  {
    title: 'Analytics',
    description: 'Get insights and trends from aggregated ratings and reviews',
    icon: IconChartBar,
  },
];

export default function FeaturesSection() {
  return (
    <section className="w-full py-16 px-4 md:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Taqyim</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <feature.icon className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
