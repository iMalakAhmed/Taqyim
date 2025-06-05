import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconMail,
} from "@tabler/icons-react";

export default function TeamSection() {
  const team = [
    {
      name: "Haya Osama",
      github: "https://github.com/HayaOsama224",
      linkedin: "https://linkedin.com/in/",
      email: "@gmail.com",
    },
    {
      name: "Farida Hanafy",
      github: "https://github.com/fariioodaazz",
      linkedin: "https://www.linkedin.com/in/farida-ashraf-0091a0301/",
      email: "Fariida.hanafy@gmail.com",
    },
    {
      name: "Farida Nasrat",
      github: "https://github.com/FH-N",
      linkedin: "https://www.linkedin.com/in/faridanasrat/",
      email: "faridanasrat@gmail.com",
    },
    {
      name: "Malak Shams",
      github: "https://github.com/iMalakAhmed",
      linkedin:
        "https://www.linkedin.com/in/malak-shams-373a6329b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
      email: "malaksh2023@outlook.com",
    },
  ];

  return (
    <div className="space-y-4 text-text-inverse">
      {team.map((member) => (
        <div key={member.name} className="flex items-center space-x-3">
          <span className="text-sm font-medium w-32">{member.name}</span>
          <a href={member.github} target="_blank" rel="noopener noreferrer">
            <IconBrandGithub className="w-5 h-5 hover:text-accent transition" />
          </a>
          <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
            <IconBrandLinkedin className="w-5 h-5 hover:text-primary transition" />
          </a>
          <a href={`mailto:${member.email}`}>
            <IconMail className="w-5 h-5 hover:text-secondary transition" />
          </a>
        </div>
      ))}
    </div>
  );
}
