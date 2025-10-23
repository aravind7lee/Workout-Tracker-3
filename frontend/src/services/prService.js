// Personal Records (PR) Service - Real-time PR tracking across entire website
export class PRService {
  static getPRKey(userId, exerciseName) {
    return `pr_${userId}_${exerciseName.toLowerCase().replace(/\s+/g, '_')}`;
  }

  static getUserPRs(userId) {
    try {
      const allPRs = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`pr_${userId}_`)) {
          const exerciseName = key.replace(`pr_${userId}_`, '').replace(/_/g, ' ');
          allPRs[exerciseName] = JSON.parse(localStorage.getItem(key));
        }
      }
      return allPRs;
    } catch (error) {
      console.error('Error getting user PRs:', error);
      return {};
    }
  }

  static getCurrentPR(userId, exerciseName) {
    try {
      const key = this.getPRKey(userId, exerciseName);
      const pr = localStorage.getItem(key);
      return pr ? JSON.parse(pr) : null;
    } catch (error) {
      console.error('Error getting current PR:', error);
      return null;
    }
  }

  static checkAndUpdatePR(userId, exerciseName, workoutData) {
    try {
      const currentPR = this.getCurrentPR(userId, exerciseName);
      const newPRs = [];

      // Calculate new metrics
      const maxWeight = Math.max(...workoutData.sets.map(set => parseFloat(set.weight) || 0));
      const totalVolume = workoutData.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
      const maxReps = Math.max(...workoutData.sets.map(set => parseInt(set.reps) || 0));
      const totalReps = workoutData.sets.reduce((sum, set) => sum + parseInt(set.reps), 0);

      // Check for new PRs
      if (!currentPR || maxWeight > (currentPR.maxWeight || 0)) {
        newPRs.push({
          type: 'Max Weight',
          value: maxWeight,
          unit: 'kg',
          previous: currentPR?.maxWeight || 0,
          improvement: maxWeight - (currentPR?.maxWeight || 0)
        });
      }

      if (!currentPR || totalVolume > (currentPR.totalVolume || 0)) {
        newPRs.push({
          type: 'Total Volume',
          value: totalVolume,
          unit: 'kg',
          previous: currentPR?.totalVolume || 0,
          improvement: totalVolume - (currentPR?.totalVolume || 0)
        });
      }

      if (!currentPR || maxReps > (currentPR.maxReps || 0)) {
        newPRs.push({
          type: 'Max Reps',
          value: maxReps,
          unit: 'reps',
          previous: currentPR?.maxReps || 0,
          improvement: maxReps - (currentPR?.maxReps || 0)
        });
      }

      if (!currentPR || totalReps > (currentPR.totalReps || 0)) {
        newPRs.push({
          type: 'Total Reps',
          value: totalReps,
          unit: 'reps',
          previous: currentPR?.totalReps || 0,
          improvement: totalReps - (currentPR?.totalReps || 0)
        });
      }

      // Update PR record if any new PRs found
      if (newPRs.length > 0) {
        const updatedPR = {
          exerciseName,
          maxWeight: Math.max(maxWeight, currentPR?.maxWeight || 0),
          totalVolume: Math.max(totalVolume, currentPR?.totalVolume || 0),
          maxReps: Math.max(maxReps, currentPR?.maxReps || 0),
          totalReps: Math.max(totalReps, currentPR?.totalReps || 0),
          lastUpdated: new Date().toISOString(),
          workoutId: workoutData.id || Date.now()
        };

        const key = this.getPRKey(userId, exerciseName);
        localStorage.setItem(key, JSON.stringify(updatedPR));

        // Dispatch PR event for real-time updates
        window.dispatchEvent(new CustomEvent('newPRRecord', {
          detail: {
            userId,
            exerciseName,
            newPRs,
            updatedPR
          }
        }));

        return newPRs;
      }

      return [];
    } catch (error) {
      console.error('Error checking/updating PR:', error);
      return [];
    }
  }

  static showPRAlert(newPRs, exerciseName) {
    if (newPRs.length === 0) return;

    // Create PR alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = 'fixed top-4 right-4 z-50 bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-lg shadow-2xl animate-bounce max-w-sm';
    alertDiv.innerHTML = `
      <div class="text-center">
        <div class="text-3xl mb-2">🏆</div>
        <div class="text-xl font-bold mb-2">NEW PR!</div>
        <div class="text-sm font-semibold mb-3">${exerciseName}</div>
        ${newPRs.map(pr => `
          <div class="text-sm bg-white/20 rounded p-2 mb-2">
            <div class="font-medium">${pr.type}: ${pr.value}${pr.unit}</div>
            <div class="text-xs">+${pr.improvement}${pr.unit} improvement!</div>
          </div>
        `).join('')}
        <div class="text-xs mt-3">🎉 Congratulations!</div>
      </div>
    `;

    document.body.appendChild(alertDiv);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.remove();
      }
    }, 5000);

    // Add click to dismiss
    alertDiv.addEventListener('click', () => {
      if (alertDiv.parentNode) {
        alertDiv.remove();
      }
    });
  }
}

export default PRService;