# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'irwan@kartoza.com'
__date__ = '13/06/2023'
__copyright__ = ('Copyright 2023, Unicef')

from django.contrib.auth import get_user_model

from core.models.profile import ROLES
from core.tests.base_tests import BaseTest
from core.tests.model_factories import GroupF, create_user

User = get_user_model()


class BasePermissionTest(BaseTest):
    """Test for Base Permission."""

    def create_resource(self, user):
        """Create resource function."""
        raise NotImplemented

    def get_resources(self, user):
        """Create resource function."""
        raise NotImplemented

    def setUp(self):
        """To setup test."""
        self.admin = create_user(
            ROLES.SUPER_ADMIN.name, password=self.password)
        self.creator = create_user(
            ROLES.CREATOR.name, password=self.password)
        self.contributor = create_user(
            ROLES.CONTRIBUTOR.name, password=self.password)
        self.viewer = create_user(
            ROLES.VIEWER.name, password=self.password)
        self.resource_creator = create_user(ROLES.CREATOR.name)

        # Resource layer attribute
        self.resource = self.create_resource(self.resource_creator)
        try:
            self.permission = self.resource.permission
        except AttributeError:
            pass

        # Creating group
        self.group = GroupF()
        self.viewer_in_group = create_user(ROLES.VIEWER.name)
        self.viewer_in_group.groups.add(self.group)
        self.contributor_in_group = create_user(ROLES.CONTRIBUTOR.name)
        self.contributor_in_group.groups.add(self.group)
        self.creator_in_group = create_user(ROLES.CREATOR.name)
        self.creator_in_group.groups.add(self.group)
