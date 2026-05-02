export const formatINR = (amount) => {
  const value = Number(amount);

  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  return `INR ${value.toLocaleString('en-IN')}`;
};

export const formatSalaryRange = (salary) => {
  if (!salary?.min || !salary?.max) {
    return 'Salary not disclosed';
  }

  return `${formatINR(salary.min)} - ${formatINR(salary.max)}`;
};
