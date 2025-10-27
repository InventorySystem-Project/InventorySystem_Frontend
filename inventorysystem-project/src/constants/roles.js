export const ROLES = {
    ADMIN: 'ADMIN',
    USER: 'USER',
    SOPORTE_N1: 'SOPORTE_N1',
    SOPORTE_N2: 'SOPORTE_N2',
    GESTOR_CAMBIOS: 'GESTOR_CAMBIOS',
    CAB_MEMBER: 'CAB_MEMBER',
    PROJECT_MANAGER: 'PROJECT_MANAGER'
};

export const ROLE_DESCRIPTIONS = {
    [ROLES.ADMIN]: 'Administrador del Sistema',
    [ROLES.USER]: 'Usuario Regular',
    [ROLES.SOPORTE_N1]: 'Gestor de Incidentes (Nivel 1)',
    [ROLES.SOPORTE_N2]: 'Gestor de Incidentes (Nivel 2)',
    [ROLES.GESTOR_CAMBIOS]: 'Gestor de Cambios',
    [ROLES.CAB_MEMBER]: 'Miembro del Comité de Cambios',
    [ROLES.PROJECT_MANAGER]: 'Project Manager'
};

export const ROLE_PERMISSIONS = {
    [ROLES.ADMIN]: ['ALL'],
    [ROLES.USER]: [
        'VIEW_OWN_TICKETS',
        'CREATE_TICKET',
        'COMMENT_OWN_TICKETS',
        'CREATE_RFC'
    ],
    [ROLES.SOPORTE_N1]: [
        'VIEW_ALL_TICKETS',
        'ASSIGN_TICKETS',
        'UPDATE_TICKET_STATUS',
        'COMMENT_ALL_TICKETS'
    ],
    [ROLES.SOPORTE_N2]: [
        'VIEW_ALL_TICKETS',
        'ASSIGN_TICKETS',
        'UPDATE_TICKET_STATUS',
        'COMMENT_ALL_TICKETS',
        'MANAGE_KNOWN_ERRORS',
        'VIEW_PROBLEMS'
    ],
    [ROLES.GESTOR_CAMBIOS]: [
        'MANAGE_CHANGES',
        'VIEW_ALL_RFC',
        'UPDATE_RFC_STATUS'
    ],
    [ROLES.CAB_MEMBER]: [
        'VIEW_ALL_RFC',
        'APPROVE_NORMAL_RFC'
    ],
    [ROLES.PROJECT_MANAGER]: [
        'VIEW_ALL_RFC',
        'APPROVE_EMERGENCY_RFC'
    ]
};