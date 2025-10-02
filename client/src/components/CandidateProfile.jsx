import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { User, Mail, Phone, Briefcase, MapPin, Github, Linkedin } from 'lucide-react';

/**
 * CandidateProfile Component
 * Displays candidate information extracted from resume
 */
export default function CandidateProfile({ profile }) {
  const profileFields = [
    { key: 'name', label: 'Name', icon: User, value: profile.name },
    { key: 'email', label: 'Email', icon: Mail, value: profile.email },
    { key: 'phone', label: 'Phone', icon: Phone, value: profile.phone },
    { key: 'designation', label: 'Designation', icon: Briefcase, value: profile.designation },
    { key: 'location', label: 'Location', icon: MapPin, value: profile.location },
    { key: 'github', label: 'GitHub', icon: Github, value: profile.github },
    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, value: profile.linkedin },
  ];

  const hasAnyField = profileFields.some(field => field.value);

  if (!hasAnyField) {
    return null;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg">Your Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profileFields.map((field) => {
            if (!field.value) return null;
            
            const Icon = field.icon;
            const isLink = field.key === 'github' || field.key === 'linkedin' || field.key === 'email';
            
            return (
              <div key={field.key} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium">{field.label}</p>
                  {isLink && (field.key === 'github' || field.key === 'linkedin') ? (
                    <a
                      href={field.value.startsWith('http') ? field.value : `https://${field.value}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline truncate block"
                    >
                      {field.value}
                    </a>
                  ) : isLink && field.key === 'email' ? (
                    <a
                      href={`mailto:${field.value}`}
                      className="text-sm text-primary hover:underline truncate block"
                    >
                      {field.value}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-900 truncate">{field.value}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
