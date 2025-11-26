'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Trophy, Users, Code, Zap } from 'lucide-react';

interface TimelineEvent {
  id: number;
  title: string;
  description: string;
  time: string;
  date: string;
  icon: React.ComponentType<any>;
  status: 'completed' | 'current' | 'upcoming' | 'live';
}

const Timeline: React.FC = () => {
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([
    {
      id: 1,
      title: "REGISTRATION OPENS",
      description: "Begin your journey. Registration portal is now live!",
      time: "00:00",
      date: "SEPT 10",
      icon: Users,
      status: 'live'
    },
    {
      id: 2,
      title: "REGISTRATION CLOSES",
      description: "Final call for participants. Prepare for evaluation.",
      time: "23:59",
      date: "SEPT 25",
      icon: Calendar,
      status: 'upcoming'
    },
    {
      id: 3,
      title: "SHORTLISTING PROCESS",
      description: "Team evaluation and selection process begins.",
      time: "12:00",
      date: "SEPT 25",
      icon: Users,
      status: 'upcoming'
    },
    {
      id: 4,
      title: "TEAMS ANNOUNCEMENT",
      description: "Selected teams will be announced and notified.",
      time: "18:00",
      date: "SEPT 28",
      icon: Zap,
      status: 'upcoming'
    },
    {
      id: 5,
      title: "HACKATHON BEGINS",
      description: "24 hours of building and innovation starts.",
      time: "00:00",
      date: "OCT 10",
      icon: Code,
      status: 'upcoming'
    },
    {
      id: 6,
      title: "SUBMISSION & WINNERS",
      description: "Final presentations and winner announcements.",
      time: "23:59",
      date: "OCT 11",
      icon: Trophy,
      status: 'upcoming'
    }
  ]);

  useEffect(() => {
    const updateEventStatuses = () => {
      const now = new Date();
      const year = 2025;

      setTimelineEvents(prevEvents => 
        prevEvents.map(event => {
          const [month, day] = event.date.split(' ');
          const [hours, minutes] = event.time.split(':');
          const eventDate = new Date(year, 
            month === 'SEPT' ? 8 : 9, 
            parseInt(day), 
            parseInt(hours), 
            parseInt(minutes)
          );

          // Special handling for registration status
          if (event.id === 1) {
            // Registration is live until the closing date
            const closingDate = new Date(year, 8, 20, 23, 59); // Sept 20, 23:59
            if (now < closingDate) {
              return { ...event, status: 'live' };
            }
          }

          // Event is in the past
          if (now > eventDate) {
            return { ...event, status: 'completed' };
          }
          
          // Event is currently happening (within 24 hours)
          const timeDiff = eventDate.getTime() - now.getTime();
          const hoursDiff = timeDiff / (1000 * 60 * 60);
          if (hoursDiff <= 24 && hoursDiff >= 0) {
            return { ...event, status: 'current' };
          }
          
          // Event is in the future
          return { ...event, status: 'upcoming' };
        })
      );
    };

    // Update initially
    updateEventStatuses();

    // Update every minute
    const interval = setInterval(updateEventStatuses, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="timeline" className="py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-orbitron font-black text-3xl sm:text-4xl lg:text-5xl mb-3 md:mb-4 tracking-wider">
            EVENT <span className="text-[#928dab]">TIMELINE</span>
          </h2>
          <div className="w-16 md:w-24 h-1 bg-[#7303c0] mx-auto mb-6 md:mb-8 clip-polygon"></div>
          <p className="text-base md:text-xl text-gray-400 max-w-2xl mx-auto font-medium px-4">
            A carefully orchestrated sequence of events leading to the ultimate coding showdown.
          </p>
        </div>

        <div className="relative">
          {/* Curved Road SVG */}
          <div className="absolute inset-0 flex justify-center pointer-events-none">
            <svg 
              width="200" 
              height="100%" 
              viewBox="0 0 200 1600" 
              className="w-16 sm:w-32 md:w-48 h-full hidden md:block"
              preserveAspectRatio="xMidYStretch"
            >
              <defs>
                <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7303c0" />
                  <stop offset="50%" stopColor="#5a0296" />
                  <stop offset="100%" stopColor="#4c0273" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <path
                d="M100 0 Q50 100 100 200 Q150 300 100 400 Q50 500 100 600 Q150 700 100 800 Q50 900 100 1000 Q150 1100 100 1200 Q150 1300 100 1400 Q50 1500 100 1600"
                stroke="url(#roadGradient)"
                strokeWidth="14"
                fill="none"
                filter="url(#glow)"
                className="drop-shadow-lg"
              />
              <path
                d="M100 0 Q50 100 100 200 Q150 300 100 400 Q50 500 100 600 Q150 700 100 800 Q50 900 100 1000 Q150 1100 100 1200 Q150 1300 100 1400 Q50 1500 100 1600"
                stroke="#0f0f0f"
                strokeWidth="4"
                fill="none"
                strokeDasharray="40,20"
                className="animate-pulse opacity-80"
              />
            </svg>
          </div>

          {/* Timeline Events */}
          <div className="relative z-10 space-y-10 md:space-y-20">
            {timelineEvents.map((event, index) => {
              const isLeft = index % 2 === 0;
              const IconComponent = event.icon;

              return (
                <div
                  key={event.id}
                  className={`
                    flex flex-col md:flex-row items-center relative group
                    ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}
                  `}
                >
                  {/* Timeline Node */}
                  <div className="relative md:absolute md:left-1/2 transform md:-translate-x-1/2 z-20 mb-6 md:mb-0">
                    <div className={`
                      w-12 h-12 md:w-16 md:h-16 flex items-center justify-center border-4 border-black shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-12
                      ${event.status === 'completed' ? 'bg-gradient-to-br from-[#7303c0] to-[#5a0296]' : 
                        event.status === 'current' ? 'bg-gradient-to-br from-[#7303c0] to-[#4c0273] animate-pulse shadow-[#7303c0]/50' : 
                        event.status === 'live' ? 'bg-gradient-to-br from-green-500 to-green-700 animate-pulse shadow-green-500/50' :
                        'bg-gradient-to-br from-gray-800 to-black'}
                    `}>
                      <IconComponent className="w-5 h-5 md:w-7 md:h-7 text-white" />
                    </div>
                    
                    {/* Connecting line to content - Desktop */}
                    <div className={`
                      hidden md:block absolute top-1/2 w-12 h-1 transition-all duration-300
                      ${isLeft ? 'right-full' : 'left-full'}
                      ${event.status === 'completed' ? 'bg-gradient-to-r from-[#7303c0] to-[#5a0296]' : 
                        event.status === 'current' ? 'bg-gradient-to-r from-[#7303c0] to-[#4c0273]' : 
                        'bg-gradient-to-r from-gray-700 to-black'}
                    `} />

                    {/* Vertical connecting line - Mobile */}
                    <div className="md:hidden absolute top-full left-1/2 w-1 h-6 transform -translate-x-1/2 bg-gradient-to-b from-[#7303c0] to-transparent" />
                  </div>

                  {/* Content Card */}
                  <div className={`
                    w-full px-4 md:px-0 md:max-w-md mx-auto md:mx-0 md:w-80 lg:w-96
                    ${isLeft ? 'md:mr-32 lg:mr-40' : 'md:ml-32 lg:ml-40'}
                  `}>
                    <div className={`
                      bg-black p-4 md:p-6 shadow-2xl hover:shadow-[#7303c0]/30 transition-all duration-300 group-hover:scale-105 border border-gray-900 hover:border-[#7303c0]/60
                      ${event.status === 'current' ? 'ring-2 ring-[#7303c0] ring-opacity-60 shadow-[#7303c0]/40' : ''}
                    `}>
                      {/* Date Badge */}
                      <div className={`
                        inline-block px-3 md:px-4 py-1 md:py-2 text-xs md:text-sm font-bold mb-2 md:mb-3 border tracking-wider
                        ${event.status === 'completed' ? 'bg-[#7303c0]/20 text-[#7303c0] border-[#7303c0]' : 
                          event.status === 'current' ? 'bg-[#7303c0]/30 text-white border-[#7303c0]' : 
                          'bg-gray-900/50 text-gray-500 border-gray-700'}
                      `}>
                        {event.date}{event.time && ` • ${event.time}`}
                      </div>

                      {/* Title */}
                      <h3 className="text-lg md:text-xl font-orbitron font-black text-white mb-2 group-hover:text-[#7303c0] transition-colors duration-200 tracking-wide">
                        {event.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm md:text-base text-gray-400 leading-relaxed font-medium">
                        {event.description}
                      </p>

                      {/* Status Indicator */}
                      <div className="mt-3 md:mt-4 flex items-center text-xs md:text-sm font-bold tracking-wider">
                        <div className={`
                          w-2 h-2 md:w-3 md:h-3 mr-2
                          ${event.status === 'completed' ? 'bg-[#7303c0]' : 
                            event.status === 'current' ? 'bg-[#7303c0] animate-pulse' : 
                            event.status === 'live' ? 'bg-green-500 animate-pulse' :
                            'bg-gray-600'}
                        `} />
                        <span className={`
                          uppercase
                          ${event.status === 'completed' ? 'text-[#7303c0]' : 
                            event.status === 'current' ? 'text-white' : 
                            event.status === 'live' ? 'text-green-500' :
                            'text-gray-500'}
                        `}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom decoration */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-[#7303c0] to-[#5a0296] flex items-center justify-center shadow-2xl shadow-[#7303c0]/50 border-2 border-[#7303c0]">
            <Trophy className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>

          {/* Mobile vertical line */}
          <div className="absolute top-0 bottom-0 left-1/2 w-1 -translate-x-1/2 bg-gradient-to-b from-[#7303c0] to-[#5a0296] md:hidden">
            <div className="absolute inset-0 opacity-25 bg-gradient-to-b from-transparent via-[#7303c0] to-transparent animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Timeline;