/******************************************************************************
 * DO NOT MUTATE INPUT OBJECTS.
 *
 * All functions in this module MUST be pure.
 ******************************************************************************/
/******************************************************************************
 * RegisterHelpers.js
 *
 * TherapistDesk
 * ---------------------------------------------------------------------------
 * Pure helper functions used by the therapist registration wizard.
 *
 * This module contains NO React code.
 * It does not know anything about:
 *   - useState()
 *   - setForm()
 *   - Components
 *   - JSX
 *
 * Every function receives data and returns NEW data.
 * No function mutates the original objects.
 *
 * Sections
 * --------
 * 1. Factory functions
 * 2. Category helpers
 * 3. Service helpers
 * 4. Location helpers
 * 5. Validation helpers
 ******************************************************************************/

/* ============================================================================
 * Factory functions
 * ========================================================================== */

/* ============================================================================
 * Constants
 * ========================================================================== */

/**
 * Internal day keys.
 */
export const WEEK_DAYS = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
];

/**
 * Day labels used by the UI.
 */
export const WEEK_DAY_LABELS = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
};

/**
 * Interval types.
 */
export const WORKING_INTERVAL_TYPES = [
    {
        value: "work",
        label: "Work",
    },
    {
        value: "break",
        label: "Break",
    },
];

/**
 * Minimum allowed interval duration in minutes.
 */
export const MIN_WORKING_INTERVAL_MINUTES = 15;

/**
 * Creates an empty service.
 */
export function createEmptyService() {
    return {
        name: "",
        description: "",

        defaultDurationMinutes: "60",
        defaultPrice: "",

        currency: "Euro",

        color: "green",

        locations: [],
    };
}

/**
 * Creates an empty category.
 */
export function createEmptyCategory() {
    return {
        name: "",
        description: "",

        color: "#4CAF50",

        services: [
            createEmptyService(),
        ],
    };
}

/**
 * Creates default working hours for a new location.
 */
export function createDefaultWorkingHours() {
    return {
        monday: [
            {
                start: "09:00",
                end: "17:00",
                type: "work",
            },
        ],

        tuesday: [
            {
                start: "09:00",
                end: "17:00",
                type: "work",
            },
        ],

        wednesday: [
            {
                start: "09:00",
                end: "17:00",
                type: "work",
            },
        ],

        thursday: [
            {
                start: "09:00",
                end: "17:00",
                type: "work",
            },
        ],

        friday: [
            {
                start: "09:00",
                end: "17:00",
                type: "work",
            },
        ],

        saturday: [],

        sunday: [],
    };
}

/**
 * Creates an empty working interval.
 */
export function createEmptyWorkingInterval() {
    return {
        id: crypto.randomUUID(),
        start: "",
        end: "",
        type: "work",
    };
}

/**
 * Converts HH:mm to minutes.
 *
 * Example:
 * "09:30" -> 570
 */
export function timeToMinutes(time) {
    if (!time) return 0;

    const [hours, minutes] = time.split(":").map(Number);

    return hours * 60 + minutes;
}

/**
 * Converts minutes to HH:mm.
 *
 * Example:
 * 570 -> "09:30"
 */
export function minutesToTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);

    const minutes = totalMinutes % 60;

    return (
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0")
    );
}

/**
 * Returns a new array of working intervals sorted by start time.
 *
 * The original array is never modified.
 */
export function sortWorkingIntervals(intervals) {
    return [...intervals].sort((a, b) => {
        return (
            timeToMinutes(a.start) -
            timeToMinutes(b.start)
        );
    });
}

/**
 * Returns a new practice object with all working hours sorted.
 *
 * Each day's intervals are sorted by start time for every
 * practice location. The original practice object is never modified.
 */
export function sortPracticeWorkingHours(practice) {
    const locations = practice.locations.map((location) => {
        const workingHours = cloneWorkingHours(
            location.workingHours
        );

        WEEK_DAYS.forEach((day) => {
            workingHours[day] = sortWorkingIntervals(
                workingHours[day]
            );
        });

        return {
            ...location,
            workingHours,
        };
    });

    return {
        ...practice,
        locations,
    };
}

/**
 * Creates a deep copy of working hours.
 *
 * Arrays and interval objects are cloned to keep all helper
 * functions immutable.
 */
export function cloneWorkingHours(workingHours) {
    const clone = {};

    for (const day in workingHours) {
        clone[day] = workingHours[day].map((interval) => ({
            ...interval,
        }));
    }

    return clone;
}

/**
 * Adds a new working interval to a day.
 */
export function addWorkingInterval(
    practice,
    locationId,
    day
) {
    const locations = practice.locations.map((location) => {
        if (location.id !== locationId) {
            return location;
        }

        const workingHours = cloneWorkingHours(
            location.workingHours
        );

        workingHours[day] = sortWorkingIntervals([
            ...workingHours[day],
            createEmptyWorkingInterval(),
        ]);

        return {
            ...location,
            workingHours,
        };
    });

    return {
        ...practice,
        locations,
    };
}

/**
 * Updates a working interval.
 */
export function updateWorkingInterval(
    practice,
    locationId,
    day,
    intervalIndex,
    field,
    value
) {
    const locations = practice.locations.map((location) => {
        if (location.id !== locationId) {
            return location;
        }

        const workingHours = cloneWorkingHours(
            location.workingHours
        );

        workingHours[day][intervalIndex] = {
            ...workingHours[day][intervalIndex],
            [field]: value,
        };

        return {
            ...location,
            workingHours,
        };
    });

    return {
        ...practice,
        locations,
    };
}

/**
 * Removes a working interval.
 */
export function removeWorkingInterval(
    practice,
    locationId,
    day,
    intervalIndex
) {
    const locations = practice.locations.map((location) => {
        if (location.id !== locationId) {
            return location;
        }

        const workingHours = cloneWorkingHours(
            location.workingHours
        );

        workingHours[day] = workingHours[day].filter(
            (_, index) => index !== intervalIndex
        );

        return {
            ...location,
            workingHours,
        };
    });

    return {
        ...practice,
        locations,
    };
}

/**
 * Copies one working day to one or more other days.
 */
export function copyWorkingDay(
    practice,
    locationId,
    sourceDay,
    targetDays
) {
    const locations = practice.locations.map((location) => {
        if (location.id !== locationId) {
            return location;
        }

        const workingHours = cloneWorkingHours(
            location.workingHours
        );

        targetDays.forEach((day) => {
            workingHours[day] = workingHours[sourceDay].map(
                (interval) => ({
                    ...interval,
                })
            );
        });

        return {
            ...location,
            workingHours,
        };
    });

    return {
        ...practice,
        locations,
    };
}

/**
 * Clears all intervals for a working day.
 */
export function clearWorkingDay(
    practice,
    locationId,
    day
) {
    const locations = practice.locations.map((location) => {
        if (location.id !== locationId) {
            return location;
        }

        const workingHours = cloneWorkingHours(
            location.workingHours
        );

        workingHours[day] = [];

        return {
            ...location,
            workingHours,
        };
    });

    return {
        ...practice,
        locations,
    };
}

/* ============================================================================
 * Working hours validation
 * ========================================================================== */

/**
 * Validates working hours for all locations.
 */
export function validateWorkingHours(locations) {
    const errors = [];

    locations.forEach((location, locationIndex) => {
        const workingHours = location.workingHours;

        WEEK_DAYS.forEach((day) => {
            const intervals = workingHours[day];

            for (let i = 0; i < intervals.length; i++) {
                const interval = intervals[i];

                const path =
                    `practice.locations[${locationIndex}].workingHours.` +
                    `${day}[${i}]`;

                // ----------------------------------------------------
                // Required values
                // ----------------------------------------------------

                if (!interval.start) {
                    errors.push(
                        createValidationError(
                            `${path}.start`,
                            `${WEEK_DAY_LABELS[day]}: start time is required.`
                        )
                    );

                    continue;
                }

                if (!interval.end) {
                    errors.push(
                        createValidationError(
                            `${path}.end`,
                            `${WEEK_DAY_LABELS[day]}: end time is required.`
                        )
                    );

                    continue;
                }

                const start = timeToMinutes(interval.start);
                const end = timeToMinutes(interval.end);

                // ----------------------------------------------------
                // Start must be before end
                // ----------------------------------------------------

                if (start >= end) {
                    errors.push(
                        createValidationError(
                            `${path}.start`,
                            `${WEEK_DAY_LABELS[day]}: start time must be before end time.`
                        )
                    );

                    continue;
                }

                // ----------------------------------------------------
                // Minimum duration
                // ----------------------------------------------------

                if (
                    end - start <
                    MIN_WORKING_INTERVAL_MINUTES
                ) {
                    errors.push(
                        createValidationError(
                            `${path}.end`,
                            `${WEEK_DAY_LABELS[day]}: interval must be at least ${MIN_WORKING_INTERVAL_MINUTES} minutes.`
                        )
                    );
                }

                // ----------------------------------------------------
                // Duplicate intervals
                // ----------------------------------------------------

                for (let j = i + 1; j < intervals.length; j++) {
                    const other = intervals[j];

                    if (
                        interval.start === other.start &&
                        interval.end === other.end
                    ) {
                        errors.push(
                            createValidationError(
                                `${path}.start`,
                                `${WEEK_DAY_LABELS[day]}: duplicate interval.`
                            )
                        );
                    }
                }

                // ----------------------------------------------------
                // Overlapping intervals
                // ----------------------------------------------------

                if (i < intervals.length - 1) {
                    const next = intervals[i + 1];

                    const nextStart = timeToMinutes(
                        next.start
                    );

                    if (nextStart < end) {
                        errors.push(
                            createValidationError(
                                `${path}.end`,
                                `${WEEK_DAY_LABELS[day]}: intervals cannot overlap.`
                            )
                        );
                    }
                }
            }
        });
    });

    if (errors.length > 0) {
        return {
            valid: false,
            errors,
        };
    }

    return validationSuccess();
}



/**
 * Creates an empty practice location.
 */
export function createEmptyLocation() {
    return {
        id: crypto.randomUUID(),

        type: "office",

        name: "",

        number: 0,

        country: "",

        city: "",

        address: "",

        notes: "",

        active: true,

        workingHours: createDefaultWorkingHours(),
    };
}

/* ============================================================================
 * Category helpers
 * ========================================================================== */

/**
 * Adds a new empty category.
 */
export function addCategory(practice) {
    return {
        ...practice,
        categories: [
            ...practice.categories,
            createEmptyCategory(),
        ],
    };
}

/**
 * Updates a single category field.
 */
export function updateCategory(
    practice,
    categoryIndex,
    field,
    value
) {
    return {
        ...practice,
        categories: practice.categories.map((category, index) =>
            index === categoryIndex
                ? {
                    ...category,
                    [field]: value,
                }
                : category
        ),
    };
}

/**
 * Removes a category.
 */
export function removeCategory(
    practice,
    categoryIndex
) {
    return {
        ...practice,
        categories: practice.categories.filter(
            (_, index) => index !== categoryIndex
        ),
    };
}
/* ============================================================================
 * Service helpers
 * ========================================================================== */

/**
 * Adds a new service to a category.
 */
export function addService(
    practice,
    categoryIndex
) {
    return {
        ...practice,
        categories: practice.categories.map((category, index) =>
            index === categoryIndex
                ? {
                    ...category,
                    services: [
                        ...category.services,
                        {
                            ...createEmptyService(),
                            color: getNextServiceColor(practice),
                        }
                    ],
                }
                : category
        ),
    };
}

/**
 * Updates a service field.
 */
export function updateService(
    practice,
    categoryIndex,
    serviceIndex,
    field,
    value
) {
    return {
        ...practice,
        categories: practice.categories.map((category, index) => {
            if (index !== categoryIndex) return category;

            return {
                ...category,
                services: category.services.map((service, idx) =>
                    idx === serviceIndex
                        ? {
                            ...service,
                            [field]: value,
                        }
                        : service
                ),
            };
        }),
    };
}

/**
 * Removes a service from a category.
 */
export function removeService(
    practice,
    categoryIndex,
    serviceIndex
) {
    return {
        ...practice,
        categories: practice.categories.map((category, index) => {
            if (index !== categoryIndex) return category;

            return {
                ...category,
                services: category.services.filter(
                    (_, idx) => idx !== serviceIndex
                ),
            };
        }),
    };
}
/* ============================================================================
 * Location helpers
 * ========================================================================== */

/**
 * Adds a new practice location.
 */
export function addLocation(practice) {
    return {
        ...practice,
        locations: [
            ...practice.locations,
            {
                ...createEmptyLocation(),
                number: getNextLocationNumber(practice),
            }
        ],
    };
}

/**
 * Updates a location field.
 */
export function updateLocation(
    practice,
    locationId,
    field,
    value
) {
    return {
        ...practice,
        locations: practice.locations.map((location) =>
            location.id === locationId
                ? {
                    ...location,
                    [field]: value,
                }
                : location
        ),
    };
}

/**
 * Removes a practice location.
 */
export function removeLocation(
    practice,
    locationId
) {
    return {
        ...practice,
        locations: practice.locations.filter(
            (location) => location.id !== locationId
        ),
    };
}

/* ============================================================================
 * Validation helpers
 * ========================================================================== */

/**
 * Creates a successful validation result.
 */
export function validationSuccess() {
    return {
        valid: true,
        errors: [],
    };
}

/**
 * Creates a validation error object.
 */
export function createValidationError(field, message) {
    return {
        field,
        message,
    };
}
/* ============================================================================
 * Practice validation
 * ========================================================================== */

/**
 * Validates therapist practice configuration.
 */
export function validatePractice(practice) {
    const errors = [];

    if (practice.categories.length === 0) {
        errors.push(
            createValidationError(
                "practice.categories",
                "Please add at least one category."
            )
        );
    }

    practice.categories.forEach((category, categoryIndex) => {
        if (!category.name.trim()) {
            errors.push(
                createValidationError(
                    `practice.categories[${categoryIndex}].name`,
                    "Category name is required."
                )
            );
        }

        if (category.services.length === 0) {
            errors.push(
                createValidationError(
                    `practice.categories[${categoryIndex}].services`,
                    "Each category must contain at least one service."
                )
            );
        }

        category.services.forEach((service, serviceIndex) => {
            if (!service.name.trim()) {
                errors.push(
                    createValidationError(
                        `practice.categories[${categoryIndex}].services[${serviceIndex}].name`,
                        "Service name is required."
                    )
                );
            }

            const duration = Number(service.defaultDurationMinutes);

            if (
                !Number.isFinite(duration) ||
                duration <= 0
            ) {
                errors.push(
                    createValidationError(
                        `practice.categories[${categoryIndex}].services[${serviceIndex}].defaultDurationMinutes`,
                        "Duration must be greater than 0 minutes."
                    )
                );
            }

            if (duration > 1440) {
                errors.push(
                    createValidationError(
                        `practice.categories[${categoryIndex}].services[${serviceIndex}].defaultDurationMinutes`,
                        "Duration cannot exceed 24 hours."
                    )
                );
            }
        });
    });

    if (errors.length > 0) {
        return {
            valid: false,
            errors,
        };
    }

    return validationSuccess();
}

/* ============================================================================
 * Basic information validation
 * ========================================================================== */

/**
 * Validates therapist basic information.
 */
export function validateBasic(basic) {
    const errors = [];

    if (!basic.firstName.trim()) {
        errors.push(
            createValidationError(
                "basic.firstName",
                "First name is required."
            )
        );
    }

    if (!basic.lastName.trim()) {
        errors.push(
            createValidationError(
                "basic.lastName",
                "Last name is required."
            )
        );
    }

    if (!basic.email.trim()) {
        errors.push(
            createValidationError(
                "basic.email",
                "Email is required."
            )
        );
    } else if (!/\S+@\S+\.\S+/.test(basic.email)) {
        errors.push(
            createValidationError(
                "basic.email",
                "Invalid e-mail address."
            )
        );
    }

    if (!basic.phone.trim()) {
        errors.push(
            createValidationError(
                "basic.phone",
                "Phone number is required."
            )
        );
    }

    if (basic.password.length < 8) {
        errors.push(
            createValidationError(
                "basic.password",
                "Password must contain at least 8 characters."
            )
        );
    }

    if (basic.password !== basic.confirmPassword) {
        errors.push(
            createValidationError(
                "basic.confirmPassword",
                "Passwords do not match."
            )
        );
    }

    if (errors.length > 0) {
        return {
            valid: false,
            errors,
        };
    }

    return validationSuccess();
}

/* ============================================================================
 * Profile validation
 * ========================================================================== */

/**
 * Validates therapist profile.
 */
export function validateProfile(profile) {
    const errors = [];

    if (!profile.country.trim()) {
        errors.push(
            createValidationError(
                "profile.country",
                "Country is required."
            )
        );
    }

    if (!profile.city.trim()) {
        errors.push(
            createValidationError(
                "profile.city",
                "City is required."
            )
        );
    }

    if (errors.length > 0) {
        return {
            valid: false,
            errors,
        };
    }

    return validationSuccess();
}

/* ============================================================================
 * Locations validation
 * ========================================================================== */

/**
 * Validates practice locations.
 */
export function validateLocations(locations) {
    const errors = [];

    if (locations.length === 0) {
        errors.push(
            createValidationError(
                "practice.locations",
                "Please add at least one location."
            )
        );
    }

    locations.forEach((location, index) => {
        if (!location.name.trim()) {
            errors.push(
                createValidationError(
                    `practice.locations[${index}].name`,
                    "Location name is required."
                )
            );
        }

        if (!location.country.trim()) {
            errors.push(
                createValidationError(
                    `practice.locations[${index}].country`,
                    "Country is required."
                )
            );
        }

        if (!location.city.trim()) {
            errors.push(
                createValidationError(
                    `practice.locations[${index}].city`,
                    "City is required."
                )
            );
        }

        if (
            location.type !== "online" &&
            !location.address.trim()
        ) {
            errors.push(
                createValidationError(
                    `practice.locations[${index}].address`,
                    "Address is required."
                )
            );
        }
    });

    if (errors.length > 0) {
        return {
            valid: false,
            errors,
        };
    }

    return validationSuccess();
}

/* ============================================================================
 * Service colors
 * ========================================================================== */

/**
 * Fixed color palette for services.
 */
export const SERVICE_COLORS = [
    { id: "violet", color: "#8E44AD" },
    { id: "indigo", color: "#3F51B5" },
    { id: "blue", color: "#2196F3" },
    { id: "green", color: "#4CAF50" },
    { id: "yellow", color: "#FBC02D" },
    { id: "orange", color: "#FB8C00" },
    { id: "red", color: "#E53935" },
];

/**
 * Returns a service color definition by id.
 */
export function getServiceColor(colorId) {
    return (
        SERVICE_COLORS.find((c) => c.id === colorId) ??
        SERVICE_COLORS[0]
    );
}

/**
 * Returns all colors currently used by services.
 */
export function getUsedServiceColors(practice) {
    return practice.categories.flatMap((category) =>
        category.services.map((service) => service.color)
    );
}

/**
 * Returns the first available service color.
 */
export function getNextServiceColor(practice) {
    const used = getUsedServiceColors(practice);

    const available = SERVICE_COLORS.find(
        (color) => !used.includes(color.id)
    );

    return available?.id ?? SERVICE_COLORS[0].id;
}

/**
 * Returns the next available location number.
 */
export function getNextLocationNumber(practice) {
    const used = practice.locations
        .map((location) => location.number)
        .filter((number) => number > 0)
        .sort((a, b) => a - b);

    let next = 1;

    for (const number of used) {
        if (number !== next) {
            break;
        }

        next++;
    }

    return next;
}