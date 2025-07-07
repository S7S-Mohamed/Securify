import { useState, useEffect } from "react";
import { achievements } from '../data/achievements';

export const useProgressTracking = () => {
  const [progress, setProgress] = useState(() => {
    const savedProgress = localStorage.getItem("securityProgress");
    return savedProgress
      ? JSON.parse(savedProgress)
      : {
          completedTopics: [],
          quizScores: {},
          lastActivity: null,
          topicsStarted: [],
          achievements: [],
        };
  });

  useEffect(() => {
    localStorage.setItem("securityProgress", JSON.stringify(progress));
  }, [progress]);

  const getCompletionPercentage = (totalTopics = 1) => {
    if (totalTopics === 0) return 0;
    return Math.round((progress.completedTopics.length / totalTopics) * 100);
  };

  const isTopicCompleted = (topicId) => {
    return progress.completedTopics.includes(parseInt(topicId));
  };

  const markTopicCompleted = (topicId, allTopics = []) => {
    if (!progress.completedTopics.includes(parseInt(topicId))) {
      setProgress((prev) => {
        const newCompleted = [...prev.completedTopics, parseInt(topicId)];
        return {
          ...prev,
          completedTopics: newCompleted,
          lastActivity: new Date().toISOString(),
          achievements: checkForNewAchievements(newCompleted, allTopics, prev.achievements),
        };
      });
    }
  };
  
  const checkForNewAchievements = (completedTopics, allTopics, currentAchievements) => {
    const newAchievements = [...currentAchievements];

    if (completedTopics.length >= 1 && !newAchievements.includes("first_steps")) {
      newAchievements.push("first_steps");
    }
    if (completedTopics.length >= 5 && !newAchievements.includes("halfway_there")) {
      newAchievements.push("halfway_there");
    }
    if (allTopics.length > 0 && completedTopics.length === allTopics.length && !newAchievements.includes("security_master")) {
      newAchievements.push("security_master");
    }

    return newAchievements;
  };


  const resetProgress = () => {
    setProgress({
      completedTopics: [], quizScores: {}, lastActivity: null, topicsStarted: [], achievements: [],
    });
  };

  return { progress, getCompletionPercentage, isTopicCompleted, markTopicCompleted, resetProgress };
};